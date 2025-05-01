import {
  db,
  kd_kingdom_dominoTable,
  kd_kingdomino_dominoTable,
  kd_playerTable,
  kingdominoTable,
} from '../../../database/database'
import { KdKingdominoDomino, KdPlayer, Kingdomino } from '../../../database/generated'
import { getDomino, endGame } from '../../../database/utils'
import { getEndgameResults } from '../game'
import { KingdominoMap } from './kingdomino-map'
import { BulkInsertKDKingdominoDomino, Turn, TurnWithPlayer } from './types'
import { getGameId, getGameState, getGameStateString, getPlayer } from './utils'

export const draw = async (kingdomino: Kingdomino['id'] | Kingdomino) => {
  if (!kingdomino) {
    throw new Error('Kingdomino vagy id-ja megadása kötelező')
  }
  const kd =
    typeof kingdomino === 'number' ? await kingdominoTable(db).findOne({ id: kingdomino }) : kingdomino
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
  if (turn.player.id !== player) {
    throw new Error('Nem a te köröd van')
  }
  if (turn.action !== 'choose') {
    throw new Error('Most nem lehet dominót választani')
  }
  await kd_kingdomino_dominoTable(db).update({ id: kingdominoDominoId }, { chosen_by_player: player })
  // Megnézzük hogy kell-e húzni
  // Csak akkor kell, ha az első 4 dominó kiválasztása után vagyunk
  const drawnDominos = await kd_kingdomino_dominoTable(db)
    .find({ kingdomino_id: drawnDomino.kingdomino_id })
    .all()
  if (drawnDominos.length <= 4 && !drawnDominos.filter((dd) => !dd.chosen_by_player).length) {
    await draw(drawnDomino.kingdomino_id)
  }

  // Visszatérünka kövi turn-nel
  return await getTurn(drawnDomino.kingdomino_id)
}

export const placeDomino = async (
  drawnDominoId: number,
  playerId: number,
  x: number,
  y: number,
  rot: number,
  inTrash?: boolean,
) => {
  if (!drawnDominoId) {
    throw new Error('Dominó megadása kötelező')
  }
  if (!playerId) {
    throw new Error('PlayerId megadása kötelező')
  }
  const drawnDomino = await kd_kingdomino_dominoTable(db).findOne({ id: drawnDominoId })
  if (!drawnDomino) {
    throw new Error('Nem található dominó a megadott idhoz')
  }
  if (!drawnDomino.kingdomino_id) {
    throw new Error('Nincs kingdomino a dominón')
  }
  if (drawnDomino.chosen_by_player !== playerId) {
    throw new Error('Nem a te dominód')
  }
  const player = await kd_playerTable(db).findOne({ id: playerId })
  if (!player) {
    throw new Error('Nem található játékos a megadott idhoz')
  }

  const turn = await getTurn(drawnDomino.kingdomino_id)
  if (turn.player.id !== playerId) {
    throw new Error('Nem a te köröd van')
  }
  if (turn.action !== 'place') {
    throw new Error('Most nem lehet dominót lerakni')
  }
  const kingdominoMap = new KingdominoMap()
  await kingdominoMap.loadAndBuild(player.kingdom)
  // Kidobjuk a dominót, az építős kód ilyenkor nem kell
  if (!inTrash) {
    // Beépítés
    if (isNaN(x) || isNaN(y) || isNaN(rot)) {
      throw new Error('helyzethez x, y, rot megadása kötelező')
    }

    const toBePlaced = {
      kingdom_id: player.kingdom,
      domino_id: drawnDomino.domino_id,
      x,
      y,
      rot,
    }
    const domino = await getDomino(drawnDomino.domino_id)
    // egy kis bűvészkedés, ez a fgv úgy se használja az id-t TODO proper type
    kingdominoMap.validateDominoPlacing({
      ...toBePlaced,
      ...domino,
      id: -1,
    })

    const [placed] = await kd_kingdom_dominoTable(db).insert(toBePlaced)
  }

  // Töröljük a kingdominobol, már a kingdomba van beépítve VAGY ki van dobva
  await kd_kingdomino_dominoTable(db).delete({ id: drawnDominoId })

  const drawnDominos = await kd_kingdomino_dominoTable(db)
    .find({ kingdomino_id: drawnDomino.kingdomino_id })
    .all()
  // Összes maradék dominót már választotta valaki -> húzunk újat
  if (drawnDominos.every((dd) => !!dd.chosen_by_player)) {
    await draw(drawnDomino.kingdomino_id)

    // Elfogyott az összes drawnDomino + deck is, nem volt mit húzni -> endgame
    const drawnDominos = await kd_kingdomino_dominoTable(db)
      .find({ kingdomino_id: drawnDomino.kingdomino_id })
      .all()
    if (!drawnDominos.length) {
      const gameId = await getGameId(drawnDomino.kingdomino_id)
      await endGame(gameId)
      const border = kingdominoMap.getKingdomBorder()
      const minX = border.minI - 6 //Math.min(...kingdomMap.dominos.map((dom) => dom.x), 0)
      const minY = border.minJ - 6 //Math.min(...kingdomMap.dominos.map((dom) => dom.y), 0)
      const width = border.maxJ - border.minJ + 1
      const height = border.maxI - border.minI + 1
      return {
        message: 'Utolsó dominó beépítése sikerült, a játék véget ért',
        map: { ...kingdominoMap, dimensions: { width, height, minX, minY } },
      }
    }
  }

  // olcsóbb lenne beépítős függvény is, mint az egészet újra felépíteni
  const points = await kingdominoMap.loadAndBuild(player.kingdom)

  // temporary, prints map to console
  kingdominoMap.printMap()
  const border = kingdominoMap.getKingdomBorder()
  const minX = border.minI - 6 //Math.min(...kingdomMap.dominos.map((dom) => dom.x), 0)
  const minY = border.minJ - 6 //Math.min(...kingdomMap.dominos.map((dom) => dom.y), 0)
  const width = border.maxJ - border.minJ + 1
  const height = border.maxI - border.minI + 1

  return {
    message: inTrash ? 'Dominó kukába helyezve' : 'Dominó beépítése sikerült',
    points: points,
    map: { ...kingdominoMap, dimensions: { width, height, minX, minY } },
  }
}

export const getTurn = async (kingdominoId: Kingdomino['id']): Promise<Turn> => {
  if (!kingdominoId) {
    throw new Error('Kingdomino id-ja megadása kötelező')
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
  const state = await getGameStateString(kingdominoId)
  if (state === 'ended') {
    // TODO proper dummy return
    return {
      player: await getPlayer(kingdomino.players[0]!),
      action: 'choose',
    }
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
    const lengthDif = dd1.length - dd2.length
    return lengthDif || (dd1.some((dd) => !dd.chosen_by_player) ? 1 : -1)
  })
  // Kikommentezem, játék végénél ez hibát dob pedig nem kéne
  // if (nextDDs.length !== BASE) {
  //   throw new Error('Hibás darabszámú húzott dominók')
  // }
  // Üres az első oszlop (játék eleje és vége)
  if (!prevDDs.length) {
    // Ha az összes dominó foglalt (játék vége, utsó 4 dominó)
    if (nextDDs.every((dd) => !!dd.chosen_by_player)) {
      const firstDom = nextDDs.sort((dd1, dd2) => dd2.domino_id! - dd1.domino_id!)[0]
      const player = await getPlayer(firstDom.chosen_by_player!)
      return {
        player,
        action: 'place',
        drawnDomino: {
          value: firstDom.domino_id!,
          drawnDominoId: firstDom.id!,
          color: player.color,
        },
      }
    } else {
      // Van még nem választott dominó (játék eleje, első 4 dominó)
      // Ilyenkor egy "random" játékos jön, aki még nem volt (mindig ugyanazt adja kingdominonként)

      let randomNumber = Number(kingdominoId)
      const allPlayers = kingdomino.players as number[]
      allPlayers.forEach((id) => (randomNumber += id || 0))
      // Készítünk egy poolt a lehetséges jövő játékosokról, majd kivesszük belóle azokat, akik már voltak (annyiszor)
      const playerPool = kingdomino.players.length === 2 ? [...allPlayers, ...allPlayers] : allPlayers
      nextDDs.forEach((dd) => {
        if (!!dd.chosen_by_player) {
          playerPool.splice(playerPool.indexOf(dd.chosen_by_player), 1)
        }
      })

      const playerId = playerPool[randomNumber % playerPool.length]!
      const player = await getPlayer(playerId)
      return {
        player,
        action: 'choose',
      }
    }
  } else {
    // Egyik oszlop sem üres
    // első oszlopban legkisebb id-jú dominó playere -> ő jön
    const firstPrevDom = prevDDs.sort((dd1, dd2) => dd1.domino_id! - dd2.domino_id!)[0]
    // Már kiválasztott dominók száma a 2. oszlopból (0-BASE)
    const chosenCnt = nextDDs.filter((dd) => !!dd.chosen_by_player).length
    // választottak + elsőben lévők szám több mint BASE (BASE+1), akkor építeni kell, az elsőből az első. (BASE+1 bábu van lerakva)
    if (BASE < chosenCnt + prevDDs.length) {
      const player = await getPlayer(firstPrevDom.chosen_by_player!)
      return {
        player,
        action: 'place',
        drawnDomino: {
          value: firstPrevDom.domino_id!,
          drawnDominoId: firstPrevDom.id!,
          color: player.color,
        },
      }
    } else {
      if (BASE !== chosenCnt + prevDDs.length) {
        throw new Error('BASE != BASE')
      }
      const player = await getPlayer(firstPrevDom.chosen_by_player!)
      // pont 4 bábu van lerakva, választ az elsőből az első
      return {
        player,
        action: 'choose',
      }
    }
  }
}
