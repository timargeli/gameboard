import { db, kd_kingdomino_dominoTable, kingdominoTable } from '../../../database/database'
import { KdKingdominoDomino, KdPlayer, Kingdomino } from '../../../database/generated'
import { BulkInsertKDKingdominoDomino, Turn } from './types'

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

  if ((kd.deck?.length || 0) < 4) {
    if (!kd.deck.length) {
      //TODO elfogyott a deck, de húznánk -> end game
      // Itt igazából semmit nem kell csinálni, esetleg jelezni lehet
    } else {
      throw new Error('Hibás darabszámú dominó a deckben')
    }
  } else {
    const newDeck = kd.deck.slice(4)
    const newDrawnDominos = kd.deck.slice(0, 4).sort()

    // Megnézzük van-e már húzott dominó, parity-jét az újnak az (első) régi ellentettjére állítjuk.
    //Ebből tudjuk hogy másik oszlopba fog kerülni a kövi 4.
    const oldDrawnDomino = await kd_kingdomino_dominoTable(db).findOne({ kingdomino_id: kd.id })
    const parity = !oldDrawnDomino?.parity

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
    throw new Error('Nincsenej játékosok. Kingdomino id: ' + kingdomino.id)
  }

  const allDrawnDominos = await kd_kingdomino_dominoTable(db).find({ kingdomino_id: kingdominoId }).all()
  if (!allDrawnDominos.length) {
    throw new Error('Nincsenek húzott dominók. Kingdomino id: ' + kingdominoId)
  }
  if (allDrawnDominos.some((dd) => !dd.domino_id)) {
    throw new Error('Hiányzó domino_id dominóról')
  }
  const trueParDrawnDominos = allDrawnDominos.filter((dd) => dd.parity)
  const falseParDrawnDominos = allDrawnDominos.filter((dd) => !dd.parity)

  // Csak egy oszlopunk van (játék eleje és vége)
  if (!trueParDrawnDominos.length || !falseParDrawnDominos.length) {
    // Megj: mindkettő length nem lehet null, különben feljebb eldobta volna. Illetve domino van rajtuk
    const validDDs = [trueParDrawnDominos, falseParDrawnDominos].find((dds) => !!dds.length)!
    // ha nincs nem választott domino, azaz mind folgalt (játék vége, utsó 4 dominó)
    if (!validDDs.some((dd) => !dd.chosen_by_player)) {
      const firstDom = validDDs.sort((dd1, dd2) => dd2.domino_id! - dd1.domino_id!)[0]
      return {
        player: firstDom.chosen_by_player!,
        action: 'place',
      }
    } else {
      // Van még nem választott dominó (játék eleje, első 4 dominó)
      const player = kingdomino.players.sort(() => Math.random() - 0.5)[0]!
      return {
        player,
        action: 'choose',
      }
    }
  } else {
    // Két oszlopunk van: az elsőben legfeljebb 4 elem lehet, a másodikban pontosan 4
    // Ha pont 4 mindkettő, akkor az elsőben csak olyan dom van, amit már választottak, a másodikban van szabad is
    const [prevDDs, nextDDs] = [trueParDrawnDominos, falseParDrawnDominos].sort((dd1, dd2) => {
      const lengtDif = dd1.length - dd2.length
      return lengtDif || dd1.some((dd) => !dd.chosen_by_player) ? -1 : 1
    })
    if (nextDDs.length !== 4) {
      throw new Error('Hibás darabszámú húzott dominók')
    }
    const firstPrevDom = prevDDs.sort((dd1, dd2) => dd2.domino_id! - dd1.domino_id!)[0]
    // Ha nincs a másodikban választott, azaz mind szabad
    if (!nextDDs.some((dd) => !dd.chosen_by_player)) {
      return {
        player: firstPrevDom.chosen_by_player!,
        action: 'choose',
      }
    } else {
      // Van a másodikban választott
      const chosenCnt = nextDDs.filter((dd) => !!dd.chosen_by_player).length
      // választottak + elsőben lévők szám több mint 4 (5), akkor építeni kell az elsőből az első. (5 bábu van lerakva)
      if (4 < chosenCnt + prevDDs.length) {
        return {
          player: firstPrevDom.chosen_by_player!,
          action: 'place',
        }
      } else {
        if (4 !== chosenCnt + prevDDs.length) {
          throw new Error('4 != 4')
        }
        // pont 4 bábu van lerakva, választ az elsőből az első
        return {
          player: firstPrevDom.chosen_by_player!,
          action: 'choose',
        }
      }
    }
  }
}
