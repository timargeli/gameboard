import React, { useEffect, useRef, useState } from 'react'
import { KingdomMap } from './kingdom/kingdomMap'
import { TurnSign } from './turn-sign/turnSign'
import { Topdecks } from './topdeck/topdecks'
import { useLocation, useParams } from 'react-router-dom'
import { BACKEND_URL } from '../../types'
import { Turn } from './turn-sign/types'
import { DominoToPlace, KingdominoMap } from './kingdom/types'
import io, { Socket } from 'socket.io-client'
import { GameState, GameStateString, PlayerData } from './types'
import { Topdeck } from './topdeck/types'
import { useToast } from '../../toast-context'
import { WinnerBoard } from './winner-board/winnerBoard'
import { Trash } from './trash/trash'

const SOCKET_URL = BACKEND_URL + 'kingdomino'

const initialMap: KingdominoMap = {
  map: null,
  dominos: [],
  points: 0,
  sideSize: 7,
  kingdominoOptions: null,
  color: '',
  dimensions: {
    width: 7,
    height: 7,
    minX: 0,
    minY: 0,
  },
}

const Kingdomino: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const playerId = searchParams.get('playerId')
  const { kingdominoId } = useParams<{ kingdominoId: string }>()

  const [turn, setTurn] = useState<Turn | null>(null)
  const [map, setMap] = useState<KingdominoMap>(initialMap)
  const [topdecks, setTopdecks] = useState<Topdeck[][]>([[]])
  const [dominoToPlace, setDominoToPlace] = useState<DominoToPlace | null>(null)
  const [gameStateString, setGameStateString] = useState<GameStateString>('in_game')
  const [endgameResults, setEndgameResults] = useState<PlayerData[] | null>(null)

  const { showToast } = useToast()

  // Socket ref, hogy ne hozzon létre minden rendernél újat
  const socketRef = useRef<typeof Socket | null>(null)

  useEffect(() => {
    if (!playerId || !kingdominoId) return
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    // Csatlakozás a játékhoz
    socket.emit('join-game', { kingdominoId, playerId })

    // Játékállapot fogadása
    socket.on('game-state', (gameState: GameState) => {
      setTurn(gameState.turn)
      setTopdecks(gameState.topdecks)
      setGameStateString(gameState.gameState)
      gameStateString === 'ended' && gameState.results && setEndgameResults(gameState.results)
    })

    return () => {
      socket.disconnect()
    }
  }, [playerId, kingdominoId])

  // Dominó választás küldése szerverre
  const chooseDomino = (drawnDominoId: number) => {
    socketRef.current?.emit(
      'choose-domino',
      { kingdominoId, drawnDominoId, playerId },
      (response: { success: boolean; message?: string }) => {
        if (!response.success && response.message) {
          showToast(response.message, 'error')
        }
      }
    )
  }

  // Dominó lerakás küldése szerverre - ez endpointtal megy, ez csak a többieknek szól (hibakezelés sincs)
  // TODO? ezt is átszervezni ide
  const placeDomino = (/*x: number, y: number, rot: number, inTrash: boolean, drawnDominoId: number*/) => {
    socketRef.current?.emit('place-domino', { kingdominoId, playerId })
  }

  // map lekérdezése
  useEffect(() => {
    fetch(`${BACKEND_URL}api/kingdomino/kingdom/get-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, kingdominoId }),
    })
      .then((response) => response.json())
      .then((data) => setMap(data.map))
  }, [turn, playerId, kingdominoId])

  // lerakandó dominó beállítása
  useEffect(() => {
    if (turn?.drawnDomino && map.color === turn.drawnDomino.color) {
      setDominoToPlace({ ...turn.drawnDomino, rot: 0 })
    } else {
      setDominoToPlace(null)
    }
  }, [turn])

  console.log('engamde', endgameResults)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // TurnSign középre
        gap: 24, // távolság a sorok között
      }}
    >
      <TurnSign turn={turn} state={gameStateString} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 32,
        }}
      >
        <KingdomMap
          map={map}
          setMap={setMap}
          dominoToPlace={dominoToPlace}
          setDominoToPlace={setDominoToPlace}
          turn={turn}
          placeDomino={placeDomino}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {!endgameResults ? (
            <Topdecks topdecks={topdecks} turn={turn} chooseDomino={chooseDomino} />
          ) : (
            <WinnerBoard winners={endgameResults}></WinnerBoard>
          )}
          {dominoToPlace && <Trash dominoToPlace={dominoToPlace} turn={turn} placeDomino={placeDomino} />}
        </div>
      </div>
    </div>
  )
}

export default Kingdomino
