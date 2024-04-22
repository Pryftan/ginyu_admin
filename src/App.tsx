import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@supabase/supabase-js'
import { Database, Event, Character} from './database.types'
import { Flex, Center, Select, FormControl, FormErrorMessage, Input, Box, Button} from '@chakra-ui/react'
import './App.css'

const supabaseUrl = 'https://bnptqkapdobymqdnlowf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHRxa2FwZG9ieW1xZG5sb3dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzU4MTU4NiwiZXhwIjoyMDI5MTU3NTg2fQ.XNpkqEFgYu2ur7MpTIr2XtWqSSZyUzgJmVqp20rGNSo'
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const matches = [['Aamer', 'Chris', 'Kirk', 'Sasha'], ['Javier', 'Kirk', 'Sasha', 'Coleman'], ['Aamer', 'Javier', 'Kirk', 'Coleman'], ['Aamer', 'Billy', 'Sasha', 'Coleman'], ['Aamer', 'Billy', 'Chris', 'Sasha'], ['Billy', 'Chris', 'Kirk', 'Sasha'], ['Aamer', 'Billy', 'Javier', 'Kirk'], ['Aamer', 'Chris', 'Kirk', 'Coleman'], ['Chris', 'Kirk', 'Sasha', 'Coleman'], ['Aamer', 'Billy', 'Javier', 'Coleman'], ['Billy', 'Chris', 'Javier', 'Sasha'], ['Billy', 'Chris', 'Javier', 'Coleman'], ['Billy', 'Chris', 'Javier', 'Kirk'], ['Aamer', 'Javier', 'Sasha', 'Coleman']]

type Player = Database['public']['Tables']['players']['Row']

interface PlayerProcessed extends Omit<Player, 'characters'>{
  characters: Array<string>
}

function App() {
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [players, setPlayers] = useState<Array<PlayerProcessed>>()
  const [events, setEvents] = useState<Array<Event>>([])
  const [selectedEvent, setSelectedEvent] = useState<Event>()
  const [characters, setCharacters] = useState<Array<Character>>([])
  const [selectedCharacters, setSelectedCharacters] = useState<Array<Character>>([])
  const [matchIndex, setMatchIndex] = useState<number>(0)

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (values: any) => {
    for (let i = 0; i < 4; i++) {
      const { error } = await supabase
        .from('scores')
        .insert([
          { event: selectedEvent?.id,
            match: matchIndex,
            player: players?.filter((player)=>player.name==matches[matchIndex][i])[0].id,
            score: values[`score_${i+1}`],
            character: selectedCharacters[i].id
          },
        ])
        .select()
      setErrorMessage(error?.message || '')
    }
    setMatchIndex(matchIndex+1)
  }

  const onCharacterSelect = (newID: number, index: number) => {
    const newSelections = selectedCharacters
    newSelections[index] = characters.filter(({id})=>id==newID)[0]
    setSelectedCharacters(newSelections)
  }

  const getEvents = async () => {
    let { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    setEvents(data || [])
    setErrorMessage(error?.message || '')
    if (data) {
      setSelectedEvent(data[0])
    }
  }

  const getData = async () => {
    let { data: characterData, error } = await supabase
      .from('characters')
      .select('*')
    setCharacters(characterData || [])
    setErrorMessage(error?.message || '')
    let { data: playerData, error: error2 } = await supabase
      .from('players')
      .select('*')
    if (playerData) {
      if (characterData) {
        setPlayers(playerData.map(({id, name, characters: playerChars})=>(
            {id: id, name: name,
              characters: playerChars.map((charID: number)=>characterData?.filter(({id})=>id==charID)[0].name) 
            }
          )
        ))
        const firstCharacter = characterData[0]
        setSelectedCharacters(matches[matchIndex].map((matchPlayer)=>(characterData?.filter((character)=>character.id==playerData?.filter(({name})=>matchPlayer==name)[0].characters[0])[0] || firstCharacter)))
      }
    }
    setErrorMessage(error2?.message || '')
  }

  const initialize = async () => {
    await getEvents()
    await getData()
  }

  useEffect(()=>{
    initialize()
  },[])

  return (
    <Center>
      <Flex flexDir={'column'} p={3} w={'500px'}>
      {events && players && characters && 
        <>
          <Select 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
              setSelectedEvent(events.filter((event)=>event.id==parseInt(e.currentTarget.value))[0])
          }}>
            {events.map((event) =>
              <option 
                key={event.id} 
                value={event.id}
              >
                {event.name} ({event.date.toString()})
              </option>
            )}
          </Select>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors.name?.message != ''}>
              {matches[matchIndex].map((player, playerIndex) =>
                <Flex key={player} flexDir='row' justify={'space-between'} alignItems='center' gap='2'>
                  <Box>
                    {player}
                  </Box>
                  <Box>
                    <Input
                      id={`score_${playerIndex+1}`}
                      {...register(`score_${playerIndex+1}`, {
                        required: 'Score is required',
                      })}
                    />
                  </Box>
                  <Box>
                    <Select 
                      defaultValue={selectedCharacters[playerIndex].id}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                        onCharacterSelect(parseInt(e.currentTarget.value), playerIndex)
                      }}
                    >
                      {characters.map(({id, name})=>
                        <option key={id} value={id}>
                          {name}
                        </option>
                      )}
                    </Select>
                  </Box>
                </Flex>
              )}
              <FormErrorMessage>
                {errors.name && typeof errors.name.message == 'string' && errors.name.message}
              </FormErrorMessage>
            </FormControl>
            <Button mt={4} colorScheme='teal' isLoading={isSubmitting} type='submit'>
              Submit
            </Button>
          </form>
        </>
      }
      {errorMessage && 
        <p>{errorMessage}</p>
      }
      </Flex>
    </Center>
  )
}

export default App
