import { db, kd_kingdomino_dominoTable, kingdominoTable } from '../../../database/database'
import { KdKingdominoDomino, KdPlayer, Kingdomino } from '../../../database/generated'
import { BulkInsertKDKingdominoDomino, Turn } from './types'

export const draw = async (kingdomino: Kingdomino['id'] | Kingdomino) => {
  if (!kingdomino) {
    throw new Error('Kingdomino vagy id-ja megadása kötelező')
  }
  console.log('Hello there', kingdomino)
  const kd =
    typeof kingdomino === 'number' ? await kingdominoTable(db).findOne({ id: kingdomino }) : kingdomino
  console.log('Hello there2', kingdomino)
  if (!kd) {
    throw new Error('Kingdomino betöltése nem sikerült')
  }
  if (!kd.deck) {
    throw new Error('Nincs deck. Kingdomino id: ' + kd.id)
  }

  const BASE = kd.players?.length === 3 ? 3 : 4

  if ((kd.deck?.length || 0) < BASE) {
    if (!kd.deck.length) {
      //TODO elfogyott a deck, de húznánk -> end game
      // Itt igazából semmit nem kell csinálni, esetleg jelezni lehet
    } else {
      throw new Error('Hibás darabszámú dominó a deckben')
    }
  } else {
    const newDeck = kd.deck.slice(BASE)
    const newDrawnDominos = kd.deck.slice(0, BASE).sort()

    // Megnézzük van-e már húzott dominó, parity-jét az újnak az (első) régi ellentettjére állítjuk.
    //Ebből tudjuk hogy másik oszlopba fog kerülni a kövi 4.
    const oldDrawnDominos = await kd_kingdomino_dominoTable(db).find({ kingdomino_id: kd.id }).all()
    const parity = !oldDrawnDominos[0]?.parity

    const bulk: BulkInsertKDKingdominoDomino[] = newDrawnDominos.map((dominoId) => {
      return {
        kingdomino_id: kd.id,
        domino_id: dominoId,
        chosen_by_player: null,
        parity: parity,
      }
    })

    const newKingdominoDomino = await kd_kingdomino_dominoTable(db).bulkInsert({
      columnsToInsert: ['kingdomino_id', 'domino_id', 'chosen_by_player', 'parity'],
      records: bulk,
    })
    // TODO drawn dominos felesleges, nincs kétirányú kapcsolat
    await kingdominoTable(db).update(
      { id: kd.id },
      { deck: newDeck, drawn_dominos: newKingdominoDomino.map((kdd) => kdd.id) },
    )
  }
}

export const chooseDomino = async (kingdominoDominoId: KdKingdominoDomino['id'], player: KdPlayer['id']) => {
  const drawnDomino = await kd_kingdomino_dominoTable(db).findOne({ id: kingdominoDominoId })
  if (!drawnDomino) {
    throw new Error('Nincs ilyen dominó')
  }
  if (!drawnDomino.kingdomino_id) {
    throw new Error('Nincs kingdomino a dominón')
  }
  if (drawnDomino.chosen_by_player) {
    throw new Error('Ezt a dominót már választotta valaki')
  }
  const turn = await getTurn(drawnDomino.kingdomino_id)
  if (turn.player !== player) {
    throw new Error('Nem a te köröd van')
  }
  if (turn.action !== 'choose') {
    throw new Error('Most nem lehet dominót választani')
  }
  await kd_kingdomino_dominoTable(db).update({ id: kingdominoDominoId }, { chosen_by_player: player })
  // Megnézzük hogy kell-e húzni
  const drawnDominos = await kd_kingdomino_dominoTable(db)
    .find({ kingdomino_id: drawnDomino.kingdomino_id })
    .all()
  if (!drawnDominos.filter((dd) => !dd.chosen_by_player).length) {
    await draw(drawnDomino.kingdomino_id)
  }
}

export const getTurn = async (kingdominoId: Kingdomino['id']): Promise<Turn> => {
  if (!kingdominoId) {
    throw new Error('Kingdomin id-ja megadása kötelező')
  }
  const kingdomino = await kingdominoTable(db).findOne({ id: kingdominoId })
  if (!kingdomino) {
    throw new Error('Kingdomino betöltése nem sikerült')
  }
  if (!kingdomino.players) {
    throw new Error('Nincsenek játékosok. Kingdomino id: ' + kingdomino.id)
  }
  if (kingdomino.players.some((p) => !p)) {
    throw new Error('Hiányzik az egyik játékos id. Kingdomino id: ' + kingdomino.id)
  }

  const allDrawnDominos = await kd_kingdomino_dominoTable(db).find({ kingdomino_id: kingdominoId }).all()
  if (!allDrawnDominos.length) {
    throw new Error('Nincsenek húzott dominók. Kingdomino id: ' + kingdominoId)
  }
  if (allDrawnDominos.some((dd) => !dd.domino_id)) {
    throw new Error('Hiányzó domino_id dominóról. Kingdomino id: ' + kingdomino.id)
  }
  const BASE = kingdomino.players?.length === 3 ? 3 : 4
  const trueParDrawnDominos = allDrawnDominos.filter((dd) => dd.parity)
  const falseParDrawnDominos = allDrawnDominos.filter((dd) => !dd.parity)

  // Két oszlopunk van: az elsőben legfeljebb BASE elem lehet, a másodikban pontosan BASE
  // Ha pont BASE mindkettő, akkor az elsőben csak olyan dom van, amit már választottak, a másodikban van szabad is
  const [prevDDs, nextDDs] = [trueParDrawnDominos, falseParDrawnDominos].sort((dd1, dd2) => {
    const lengtDif = dd1.length - dd2.length
    return lengtDif || dd1.some((dd) => !dd.chosen_by_player) ? 1 : -1
  })
  console.log('prev', prevDDs)
  console.log('nextDDs', nextDDs)
  if (nextDDs.length !== BASE) {
    throw new Error('Hibás darabszámú húzott dominók')
  }
  // Üres az első oszlop (játék eleje és vége)
  if (!prevDDs.length) {
    // Ha az összes dominó foglalt (játék vége, utsó 4 dominó)
    if (nextDDs.every((dd) => !!dd.chosen_by_player)) {
      const firstDom = nextDDs.sort((dd1, dd2) => dd2.domino_id! - dd1.domino_id!)[0]
      console.log('I have come1')
      return {
        player: firstDom.chosen_by_player!,
        action: 'place',
      }
    } else {
      // Van még nem választott dominó (játék eleje, első 4 dominó)
      // Ilyenkor egy "random" játékos jön, aki még nem volt (mindig ugyanazt adja kingdominonként)

      const randomNumber = kingdominoId + kingdomino.players.reduce((acc: number, p) => acc + (p || 0), 0)
      const allPlayers = kingdomino.players as number[]
      // Készítünk egy poolt a lehetséges jövő játékosokról, majd kivesszük belóle azokat, akik már voltak (annyiszor)
      const playerPool = kingdomino.players.length === 2 ? [...allPlayers, ...allPlayers] : allPlayers
      console.log('Playerpoolfirst', playerPool)
      nextDDs.forEach((dd) => {
        if (!!dd.chosen_by_player) {
          playerPool.splice(playerPool.indexOf(dd.chosen_by_player), 1)
        }
      })

      console.log('kingdomino.players', kingdomino.players)
      console.log('allPlayers', allPlayers)
      console.log('Playerpool', playerPool)

      const player = playerPool[randomNumber % playerPool.length]!
      console.log('I have come2')
      return {
        player,
        action: 'choose',
      }
    }
  } else {
    // Egyik oszlop sem üres
    // első oszlopban legkisebb id-jú dominó playere -> ő jön
    const firstPrevDom = prevDDs.sort((dd1, dd2) => dd1.domino_id! - dd2.domino_id!)[0]
    console.log('firstPrevDom', firstPrevDom)
    // Már kiválasztott dominók száma a 2. oszlopból (0-BASE)
    const chosenCnt = nextDDs.filter((dd) => !!dd.chosen_by_player).length
    console.log('chosenCnt', chosenCnt)
    // választottak + elsőben lévők szám több mint BASE (BASE+1), akkor építeni kell, az elsőből az első. (BASE+1 bábu van lerakva)
    if (BASE < chosenCnt + prevDDs.length) {
      console.log('I have come3')
      return {
        player: firstPrevDom.chosen_by_player!,
        action: 'place',
      }
    } else {
      if (BASE !== chosenCnt + prevDDs.length) {
        throw new Error('BASE != BASE')
      }
      // pont 4 bábu van lerakva, választ az elsőből az első
      console.log('I have come4')
      return {
        player: firstPrevDom.chosen_by_player!,
        action: 'choose',
      }
    }
  }
}
