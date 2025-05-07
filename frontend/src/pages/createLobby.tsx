// pages/CreateLobby.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/button'
import { Dropdown } from '../components/dropdown'
import { BACKEND_URL, DefaultColors } from '../types'
import { gameNames, getPlayerOptions } from '../boardgames/utils'
import { BoardgameOptions } from '../components/boardgameOptions'
import { useToast } from '../toast-context'

export const CreateLobby: React.FC = () => {
  const [gameName, setGameName] = useState('')
  const [minPlayers, setMinPlayers] = useState<number | string>('')
  const [maxPlayers, setMaxPlayers] = useState<number | string>('')
  const [minPlayerOptions, setMinPlayerOptions] = useState<number[]>([])
  const [maxPlayerOptions, setMaxPlayerOptions] = useState<number[]>([])
  const [gameOptions, setGameOptions] = useState<number | null>(null)
  const [boardgameOptions, setBoardgameOptions] = useState<any | null>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Ha játékot váltunk, reseteljük a min/max player választást
  const handleGameChange = (gName: string) => {
    setGameName(gName)
    setMinPlayers('')
    setMaxPlayers('')

    setGameOptions(null)
    setBoardgameOptions(null)

    const playerOptions = getPlayerOptions(gName)
    setMinPlayerOptions(playerOptions.minPlayerOptions)
    setMaxPlayerOptions(playerOptions.maxPlayerOptions)
  }

  const handleCreateLobby = async () => {
    if (!gameName || !minPlayers || !maxPlayers || !boardgameOptions) return

    let gameOptionsId = gameOptions

    // Ha még nincs gameOptions, akkor előbb azt hozzuk létre
    if (!gameOptionsId) {
      try {
        const response = await fetch(`${BACKEND_URL}api/game-options/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameName,
            ...boardgameOptions,
          }),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Valami hiba történt!')
        }
        const data = await response.json()
        gameOptionsId = data.gameOptionsId
        setGameOptions(gameOptionsId)
      } catch (error: any) {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
        return
      }
    }

    // Most már biztosan van gameOptionsId
    try {
      const response = await fetch(`${BACKEND_URL}api/lobby/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameName,
          gameOptions: gameOptionsId,
          minPlayers,
          maxPlayers,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Valami hiba történt!')
      }
      await response.json()
      navigate('/lobbies')
    } catch (error: any) {
      showToast(error.message || 'Ismeretlen hiba történt!', 'error')
    }
  }

  // Létrehozás gomb csak akkor aktív, ha minden ki van választva
  const canCreate = !!gameName && !!minPlayers && !!maxPlayers && !!boardgameOptions

  console.log('maxplayers', maxPlayers)

  return (
    <div
      style={{
        margin: '48px auto',
        padding: '32px 0',
        background: DefaultColors.BROWN,
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '4px solid white',
        minWidth: 450,
        maxWidth: 600,
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 700,
        fontSize: 22,
        color: '#333',
        letterSpacing: 1,
        position: 'relative',
        animation: 'pop 0.7s',
        height: 600,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 32px',
          marginBottom: 28,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color: DefaultColors.YELLOW, letterSpacing: 2 }}>
          Lobby létrehozása
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '0 32px',
        }}
      >
        {/* Játék kiválasztása */}
        <div style={{ marginBottom: 24, textAlign: 'left' }}>
          <div style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Játék:</div>
          <Dropdown
            options={[{ value: '', label: 'Válassz játékot...' }, ...gameNames]}
            value={gameName}
            onChange={handleGameChange}
            backgroundColor={DefaultColors.YELLOW_GREEN}
          />
        </div>

        {/* player cnt settings and boardgame settings */}
        {gameName && (
          <>
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Minimum játékos:</div>
                <Dropdown
                  options={[
                    { value: '', label: 'Válassz...' },
                    ...minPlayerOptions.map((o) => ({ value: o, label: o.toString() })),
                  ]}
                  value={minPlayers}
                  onChange={setMinPlayers}
                  backgroundColor={DefaultColors.YELLOW_GREEN}
                />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Maximum játékos:</div>
                <Dropdown
                  options={[
                    { value: '', label: 'Válassz...' },
                    ...maxPlayerOptions.map((o) => ({ value: o, label: o.toString() })),
                  ]}
                  value={maxPlayers}
                  onChange={setMaxPlayers}
                  backgroundColor={DefaultColors.YELLOW_GREEN}
                />
              </div>
            </div>
            <BoardgameOptions
              gameName={gameName}
              boardgameOptions={boardgameOptions}
              setBoardgameOptions={setBoardgameOptions}
            />
          </>
        )}
      </div>

      {/* Gombok legalul */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          padding: '0 32px',
        }}
      >
        <Button onClick={handleCreateLobby} disabled={!canCreate}>
          Create lobby
        </Button>
        <Button onClick={() => navigate('/lobbies')} variant="delete">
          Vissza
        </Button>
      </div>
    </div>
  )
}
