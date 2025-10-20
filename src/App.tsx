import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@supabase/supabase-js'
import { Database} from './database.types'
import { Flex, Center, Select, FormControl, FormErrorMessage, Spacer, Input, Box, Button} from '@chakra-ui/react'
import './App.css'

const supabaseUrl = 'https://bnptqkapdobymqdnlowf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHRxa2FwZG9ieW1xZG5sb3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1ODE1ODYsImV4cCI6MjAyOTE1NzU4Nn0.00HoKGwNxSdzJjFHSoxbJSt0BqrtTMyNJQSRBqxcre8'
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const matchesAll = [
  [['Aamer', 'Kirk', 'Sasha', 'Coleman'], ['Billy', 'Chris', 'Javier', 'Kirk'], ['Aamer', 'Javier', 'Kirk', 'Sasha'], ['Aamer', 'Billy', 'Sasha', 'Coleman'], ['Aamer', 'Billy', 'Chris', 'Kirk'], ['Chris', 'Javier', 'Sasha', 'Coleman'], ['Billy', 'Chris', 'Javier', 'Sasha'], ['Aamer', 'Javier', 'Kirk', 'Coleman'], ['Chris', 'Javier', 'Kirk', 'Coleman'], ['Aamer', 'Billy', 'Javier', 'Coleman'], ['Aamer', 'Chris', 'Kirk', 'Sasha'], ['Billy', 'Chris', 'Sasha', 'Coleman'], ['Aamer', 'Billy', 'Chris', 'Javier'], ['Billy', 'Kirk', 'Sasha', 'Coleman']],
  [['Chris', 'Coleman', 'Javier', 'Kirk'], ['Aamer', 'Billy', 'Chris', 'Kirk'], ['Aamer', 'Billy', 'Coleman', 'Javier'], ['Aamer', 'Chris', 'Coleman', 'Javier'], ['Aamer', 'Billy', 'Coleman', 'Kirk'], ['Billy', 'Chris', 'Coleman', 'Javier'], ['Aamer', 'Chris', 'Javier', 'Kirk'], ['Aamer', 'Billy', 'Chris', 'Coleman'], ['Billy', 'Coleman', 'Javier', 'Kirk'], ['Billy', 'Chris', 'Javier', 'Kirk'], ['Aamer', 'Billy', 'Javier', 'Kirk'], ['Aamer', 'Chris', 'Coleman', 'Kirk']],
  [['Aamer', 'Kirk', 'Sasha', 'Coleman'], ['Billy', 'Kirk', 'Sasha', 'Coleman'], ['Aamer', 'Javier', 'Kirk', 'Sasha'], ['Billy', 'Javier', 'Sasha', 'Coleman'], ['Aamer', 'Billy', 'Kirk', 'Coleman'], ['Javier', 'Kirk', 'Sasha', 'Coleman'], ['Aamer', 'Billy', 'Chris', 'Sasha'], ['Billy', 'Chris', 'Javier', 'Kirk'], ['Aamer', 'Chris', 'Kirk', 'Coleman'], ['Aamer', 'Chris', 'Javier', 'Sasha'], ['Billy', 'Chris', 'Javier', 'Coleman'], ['Aamer', 'Billy', 'Chris', 'Javier'], ['Aamer', 'Chris', 'Javier', 'Kirk'], ['Billy', 'Chris', 'Sasha', 'Coleman']]
]

type Player = Database['public']['Tables']['players']['Row']
type Event = Database['public']['Tables']['events']['Row']
type Character = Database['public']['Tables']['characters']['Row']

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
  const [matchSetIndex, setMatchSetIndex] = useState<number>(0)
  const [isCovered, setIsCovered] = useState(false)
  const [selectedCover, setSelectedCover] = useState("DK")
  const [isLive, setLive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

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
            match: matchIndex + 1,
            player: players?.filter((player)=>player.name==matchesAll[matchSetIndex][matchIndex][i])[0].id,
            score: values[`score_${i+1}`],
            character: selectedCharacters[i].id
          },
        ])
        .select()
      setErrorMessage(error?.message || '')
    }
    if(matchIndex + 1 < matchesAll[matchSetIndex].length) {
      setMatchIndex(matchIndex+1)
    } else {
      setIsFinished(true)
    }
    setLivePlayers(matchesAll[matchSetIndex][matchIndex+1])
  }

  const onCharacterSelect = (newID: number, index: number) => {
    const newSelections = selectedCharacters
    newSelections[index] = characters.filter(({id})=>id==newID)[0]
    setSelectedCharacters(newSelections)
  }

  const onCoverSelect = async (type: string) => {
    if (isCovered) {
      const { error } = await supabase
      .from('states')
      .update({'enabled': !isCovered})
      .eq('id','cover')
      setErrorMessage(error?.message || '')
      setIsCovered(!isCovered)
      return
    }
    var coverData = {}
    if (type == 'DK') {
      coverData = {
        "image": "/covers/dk_shrug.png",
        "size": 1200,
        "top": -300,
        "hides": true
      }
    } else if (type == 'Yoshi') {
      coverData = {
        "image": "/covers/yoshi_egg.png",
        "size": 400,
        "top": 70,
        "hides": false
      }
    } else if (type == 'Aamer') {
      coverData = {
        "image": "/covers/aamersrules.png",
        "size": 400,
        "top": 70,
        "hides": false
      }
    } else if (type == 'Luigi') {
      coverData = {
        "image": "/covers/luigi.png",
        "size": 400,
        "top": 30,
        "hides": false
      }
    } else if (type == 'Smash') {
      coverData = {
        "image": "/covers/smashball.png",
        "size": 400,
        "top": 70,
        "hides": false
      }
    } else if (type == 'Chief') {
      coverData = {
        "image": "/covers/tribalchief.png",
        "size": 500,
        "top": 90,
        "hides": false
      }
    } else if (type == 'Piranha') {
      coverData = {
        "image": "/covers/piranha.png",
        "size": 500,
        "top": 20,
        "hides": false
      }
    } else if (type == 'Sephiroth') {
      coverData = {
        "image": "/covers/sephiroth.png",
        "size": 500,
        "top": 90,
        "hides": false
      }
    } else if (type == 'Belt') {
      coverData = {
        "image": "/covers/belt.png",
        "size": 600,
        "top": 110,
        "hides": false
      }
    }
    const { error } = await supabase
      .from('states')
      .update({'enabled': !isCovered, data: coverData})
      .eq('id','cover')
    setErrorMessage(error?.message || '')
    setIsCovered(!isCovered)
  }

  const onLiveSelect = async () => {
    const { error } = await supabase
      .from('states')
      .update({'enabled': !isLive})
      .eq('id','playing')
    setErrorMessage(error?.message || '')
    setLive(!isLive)
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
        setSelectedCharacters(matchesAll[matchSetIndex][matchIndex].map((matchPlayer)=>(characterData?.filter((character)=>character.id==playerData?.filter(({name})=>matchPlayer==name)[0].characters[0])[0] || firstCharacter)))
      }
    }
    setErrorMessage(error2?.message || '')
    let { data: stateData, error: error3 } = await supabase
      .from('states')
      .select('*')
    if (stateData) {
      setLive(stateData?.filter((state)=>state.id=='playing')[0].enabled)
    }
    setErrorMessage(error3?.message || '')
    setLivePlayers(matchesAll[matchSetIndex][matchIndex])
  }

  const setLivePlayers = async (currentPlayers: Array<string>) => {
    let { error: error4 } = await supabase
      .from('states')
      .update({'data': {"players": currentPlayers}})
      .eq('id','playing')
    setErrorMessage(error4?.message || '')
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
      {events && players && characters && !isFinished &&
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
              {matchesAll[matchSetIndex][matchIndex].map((player, playerIndex) =>
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
              <Flex flexDir='row' justify={'space-between'} alignItems='center' gap='2'>
                <Spacer />
                <Box>Match #:</Box>
                <Input id={'inputMatchIndex'} value={matchIndex+1} width='auto' onChange={(e)=>setMatchIndex(parseInt(e.currentTarget.value)-1)}/>
                <Spacer />
              </Flex>
              <Flex flexDir='row' justify={'space-between'} alignItems='center' gap='2'>
                <Spacer />
                <Box>Match Set #:</Box>
                <Input id={'inputMatchSetIndex'} value={matchSetIndex+1} width='auto' onChange={(e)=>setMatchSetIndex(parseInt(e.currentTarget.value)-1)}/>
                <Spacer />
              </Flex>
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
        <Spacer p={3}/>
        <Center>
          <Flex w={'100%'}>
            <Select defaultValue="DK"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                setSelectedCover(e.currentTarget.value)
            }}>
              {["DK", "Yoshi", "Aamer", "Luigi", "Smash", "Chief", "Piranha", "Sephiroth", "Belt"].map((opt) =>
                <option value={opt}>{opt}</option>
              )}
            </Select>
            <Button onClick={() => onCoverSelect(selectedCover)}>{isCovered ? 'Uncover' : 'Cover'}</Button>
          </Flex>
        </Center>
        <Spacer p={3}/>
        <Center>
          <Button onClick={onLiveSelect}>
            {isLive ? "Live off" : "Live on"}
          </Button>
        </Center>
      </Flex>
    </Center>
  )
}

export default App
