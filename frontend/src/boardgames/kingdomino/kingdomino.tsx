import React, { useEffect, useRef, useState } from 'react'
import { KingdomMap } from './kingdom/kingdomMap'
import { TurnSign } from './turn-sign/turnSign'
import { Topdecks } from './topdeck/topdecks'
import { useNavigate, useParams } from 'react-router-dom'
import { BACKEND_URL, DefaultColors } from '../../types'
import { Turn } from './turn-sign/types'
import { DominoToPlace, KingdominoMap } from './kingdom/types'
import io, { Socket } from 'socket.io-client'
import { GameState, GameStateString, PlayerData } from './types'
import { Topdeck } from './topdeck/types'
import { useToast } from '../../toast-context'
import { WinnerBoard } from './winner-board/winnerBoard'
import { Trash } from './trash/trash'
import { translateColor, useWindowSize } from './utils'
import { useAuth } from '../../auth-context'
import { Button } from '../../components/button'

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
  const { kingdominoId } = useParams<{ kingdominoId: string }>()

  const [turn, setTurn] = useState<Turn | null>(null)
  const [map, setMap] = useState<KingdominoMap>(initialMap)
  const [topdecks, setTopdecks] = useState<Topdeck[][]>([[]])
  const [dominoToPlace, setDominoToPlace] = useState<DominoToPlace | null>(null)
  const [gameStateString, setGameStateString] = useState<GameStateString>('in_game')
  const [endgameResults, setEndgameResults] = useState<PlayerData[] | null>(null)

  const size = useWindowSize()
  // TODO okosabb méret: mapsize, magasság
  const baseSize = Math.max(64, Math.min(256, size.width * 0.07))

  const { showToast } = useToast()
  const navigate = useNavigate()
  const { userId } = useAuth()

  // Socket ref, hogy ne hozzon létre minden rendernél újat
  const socketRef = useRef<typeof Socket | null>(null)

  useEffect(() => {
    if (!kingdominoId) return
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    // Csatlakozás a játékhoz
    socket.emit('join-game', { kingdominoId, userId })

    // Játékállapot fogadása
    socket.on('game-state', (gameState: GameState) => {
      setTurn(gameState.turn)
      setTopdecks(gameState.topdecks)
      setGameStateString(gameState.gameState)
      gameState.results && setEndgameResults(gameState.results)
    })

    return () => {
      socket.disconnect()
    }
  }, [userId, kingdominoId])

  // Dominó választás küldése szerverre
  const chooseDomino = (drawnDominoId: number) => {
    socketRef.current?.emit(
      'choose-domino',
      { kingdominoId, drawnDominoId, userId },
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
    socketRef.current?.emit('place-domino', { kingdominoId })
  }

  // map lekérdezése
  useEffect(() => {
    fetch(`${BACKEND_URL}api/kingdomino/kingdom/get-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, kingdominoId }),
    })
      .then((response) => response.json())
      .then((data) => setMap(data.map))
  }, [turn, userId, kingdominoId])

  // lerakandó dominó beállítása
  useEffect(() => {
    if (turn?.drawnDomino && map.color === turn.drawnDomino.color) {
      setDominoToPlace({ ...turn.drawnDomino, rot: 0 })
    } else {
      setDominoToPlace(null)
    }
  }, [turn])

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      {/* Turnsign és vissza gomb*/}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* TurnSign középen */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <TurnSign turn={turn} state={gameStateString} baseSize={baseSize} />
        </div>
        {/* Vissza gomb jobb felső sarokban */}
        <div
          style={{
            position: 'relative',
            right: 24,
            top: 0,
          }}
        >
          <Button
            onClick={() => navigate('/lobbies')}
            background={
              gameStateString === 'ended'
                ? DefaultColors.BROWN
                : translateColor(turn?.player.color || DefaultColors.BROWN)
            }
          >
            &#8592;
          </Button>
        </div>
      </div>
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
          baseSize={baseSize}
          turn={turn}
          placeDomino={placeDomino}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {!endgameResults ? (
            <Topdecks topdecks={topdecks} turn={turn} chooseDomino={chooseDomino} baseSize={baseSize * 0.9} />
          ) : (
            <WinnerBoard winners={endgameResults} baseSize={baseSize}></WinnerBoard>
          )}
          {dominoToPlace && (
            <Trash
              dominoToPlace={dominoToPlace}
              turn={turn}
              placeDomino={placeDomino}
              baseSize={baseSize * 0.7}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Kingdomino
