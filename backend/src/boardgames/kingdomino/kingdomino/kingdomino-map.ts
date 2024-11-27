import { db, kd_kingdomTable, sql } from '../../../database/database'
import { KdKingdom } from '../../../database/generated'
import { Cell, CellType } from '../types'
import { PlacedDominoJoined, Territory } from './types'
import { createCellData, getKingdominoOptions } from './utils'

export class KingdominoMap {
  map: Cell[][]
  points: number
  territories: Territory[]
  sideSize: number

  constructor() {
    this.map = Array.from({ length: 13 }, () => new Array(13).fill(null))
    this.map[6][6] = {
      type: CellType.castle,
      crowns: 0,
      i: 6,
      j: 6,
    }
    this.points = 0
    this.territories = []
    this.sideSize = 0
  }

  async loadData(kingdom: KdKingdom | KdKingdom['id']) {
    const kd = typeof kingdom === 'number' ? await kd_kingdomTable(db).findOne({ id: kingdom }) : kingdom
    if (!kd) {
      throw new Error('Nem sikerült kingdomot id alapján megtalálni')
    }
    const kingdominoOptions = await getKingdominoOptions(kd.kingdomino_id)

    // kinullázzunk mindent, ha nem null
    if (!this.sideSize) {
      // TODO check kel ez ide
      this.points = 0
      this.territories = []
    }

    // TODO ! options on de több mint két játékos? createnel?
    this.sideSize = kingdominoOptions.big_kingdom_enabled ? 7 : 5

    const pDominos = (await db.query(sql`
      SELECT * FROM kd_kingdom_domino kd
      JOIN kd_domino dom ON dom.value = kd.domino_id
      WHERE kd.kingdom_id=${kd.id}
    `)) as PlacedDominoJoined[]

    return pDominos
  }

  async loadAndBuild(kingdom: KdKingdom | KdKingdom['id']) {
    const pDominos = await this.loadData(kingdom)
    return this.build(pDominos)
  }

  build(pDominos: PlacedDominoJoined[]) {
    if (!pDominos.length) {
      return this.points
    }
    // Feltételezzük, hogy helyesek a dominók; feltöltjük a mapot
    pDominos.forEach((pdom) => {
      const { c1, c2 } = createCellData(pdom)
      this.map[c1.i][c1.j] = c1
      this.map[c2.i][c2.j] = c2
    })

    // Felépítjük a territorykat
    this.buildTerritories()

    // visszatérünk a pontszámmal
    return this.points
  }

  buildTerritories() {
    this.points = 0
    this.territories = []
    this.map.forEach((cRow, i) => {
      cRow.forEach((cell, j) => {
        if (cell) {
          this.mergeCellIntoTerritories(cell)
        }
      })
    })
    this.territories.forEach((territory) => {
      this.points += territory.cells.length * territory.crowns
    })
  }

  mergeCellIntoTerritories(cell: NonNullable<Cell>) {
    const typeNeighbours = this.findNeigboursWithSameType(cell)
    const nTers: Territory[] = []
    // Megkeressük a tipus szomszédokra a hozzájuk tartozó territoryt
    typeNeighbours.forEach((tn) => {
      const nTer = this.territories.find((ter) => ter.cells.some((c) => c.i === tn.i && c.j === tn.j))
      if (!nTer) {
        throw new Error('Nem található territory a type szomszédhoz')
      }
      nTers.push(nTer)
    })

    // Attól függően, hogy hány szomszédos territorynk van, újat hozunk létre a cellnek, hozzáadjuk egyhez, vagy összevonunk 2-t
    switch (nTers.length) {
      case 0:
        this.territories.push({
          type: cell.type,
          crowns: cell.crowns,
          cells: [cell],
        })
        break
      case 1:
        nTers[0].cells.push(cell)
        nTers[0].crowns += cell.crowns
        break
      case 2:
        nTers[0].cells.push(cell, ...nTers[1].cells)
        nTers[0].crowns += cell.crowns + nTers[1].crowns
        this.territories.splice(this.territories.indexOf(nTers[1]), 1)
        break
      default:
        throw new Error('Hibás nTers length' + nTers.length)
    }
  }

  findNeigboursWithSameType(cell: NonNullable<Cell>) {
    const typeNeighbours: NonNullable<Cell>[] = []
    // Elég fel meg balra checkolni a szomszédokat, onnan jöttünk
    const upCell = this.getCell(cell.i, cell.j - 1)
    const leftCell = this.getCell(cell.i - 1, cell.j)
    if (upCell && upCell.type === cell.type) {
      typeNeighbours.push(upCell)
    }
    if (leftCell && leftCell.type === cell.type) {
      typeNeighbours.push(leftCell)
    }
    return typeNeighbours
  }

  getCell(i: number, j: number) {
    if (i < 0 || i > 12 || j < 0 || j > 12) {
      return null
    }
    const retCell = this.map[i][j]
    return this.map[i][j]
  }

  validateDominoPlacing(pDom: PlacedDominoJoined) {
    const { c1, c2 } = createCellData(pDom)
    const cells: NonNullable<Cell>[] = [c1, c2]
    // Átfedés létező dominóval
    if (this.map[c1.i][c1.j] || this.map[c2.i][c2.j]) {
      throw new Error(
        `Nem teheted rá meglévő dominóra: ${JSON.stringify(this.map[c1.i][c1.j])} ${JSON.stringify(this.map[c2.i][c2.j])}`,
      )
    }
    // Kilógás ellenőrzése
    const border = this.getKingdomBorder()
    cells.forEach((cell) => {
      const marginI = this.sideSize - (border.maxI - border.minI)
      const marginJ = this.sideSize - (border.maxJ - border.minJ)
      if (
        cell.i < border.minI - marginI ||
        cell.i > border.maxI + marginI ||
        cell.j < border.minJ - marginJ ||
        cell.j > border.maxJ + marginJ
      ) {
        throw new Error('A dominó kilóg a királyságból')
      }
    })

    // Szomszéd típus ellenőrzés
    const hasMatchingNeighbour = cells.some((cell) => {
      const neighbourCells = this.getNeighbourCells(cell)
      return neighbourCells.some((nCell) => {
        if (nCell.type === cell.type || nCell.type === CellType.castle) {
          return true
        }
        return false
      })
    })

    if (!hasMatchingNeighbour) {
      throw new Error('Nincs szomszédos ugyanolyan mező')
    }
  }

  getNeighbourCells(cell: NonNullable<Cell>): NonNullable<Cell>[] {
    const nCells: Cell[] = []
    nCells.push(this.getCell(cell.i + 1, cell.j))
    nCells.push(this.getCell(cell.i, cell.j - 1))
    nCells.push(this.getCell(cell.i - 1, cell.j))
    nCells.push(this.getCell(cell.i, cell.j + 1))
    return nCells.filter((c) => !!c)
  }
  getKingdomBorder() {
    let minI = 12,
      maxI = 0,
      minJ = 12,
      maxJ = 0
    this.map.forEach((cRow) => {
      cRow.map((cell) => {
        if (cell) {
          if (cell.i < minI) {
            minI = cell.i
          }
          if (cell.i > maxI) {
            maxI = cell.i
          }
          if (cell.j < minJ) {
            minJ = cell.j
          }
          if (cell.j > maxJ) {
            maxJ = cell.j
          }
        }
      })
    })

    return {
      minI,
      maxI,
      minJ,
      maxJ,
    }
  }

  // Temporary
  printMap() {
    let map = ''
    const border = this.getKingdomBorder()
    for (let i = border.minI; i <= border.maxI; i++) {
      for (let j = border.minJ; j <= border.maxJ; j++) {
        const cell = this.map[i][j]
        map += ` ${cellTypeToChars(cell?.type)}${cell?.crowns || 0} `
      }
      map += '\n'
    }

    console.log(`Drawing kingdom. Points: ${this.points}`)
    console.log(map)
  }
}

const cellTypeToChars = (cellType: CellType | undefined) => {
  switch (cellType) {
    case CellType.wheat:
      return 'G'
    case CellType.forest:
      return 'E'
    case CellType.lake:
      return 'T'
    case CellType.land:
      return 'L'
    case CellType.swamp:
      return 'M'
    case CellType.mine:
      return 'B'
    case CellType.castle:
      return 'K'
    default:
      return ' '
  }
}
