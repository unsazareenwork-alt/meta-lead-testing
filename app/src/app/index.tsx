import { useState, useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'

const SERVER_URL = 'https://liability-retold-ahoy.ngrok-free.dev'

export default function Index() {
  const [leads, setLeads] = useState<any[]>([])
  const [status, setStatus] = useState('Connecting...')

  useEffect(() => {
    
    fetch(`${SERVER_URL}/leads`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeads(data)
          setStatus('Connected')
        } else {
          setStatus('Server did not return a list')
        }
      })
      .catch((err) => setStatus('Load failed: ' + err.message))

    
    const wsUrl = SERVER_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/socket.io/?EIO=4&transport=websocket'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setStatus('Connected')
    }

    ws.onmessage = (event) => {
      const message = event.data
     
      if (message.startsWith('42')) {
        try {
          const jsonStr = message.substring(2)
          const parsed = JSON.parse(jsonStr)
          const eventName = parsed[0]
          const eventData = parsed[1]

          if (eventName === 'new-lead') {
            setLeads((prevLeads) => [eventData, ...prevLeads])
          }
        } catch (e) {
        
        }
      }
    }

    ws.onerror = (err) => {
      setStatus('Socket error')
    }

    ws.onclose = () => {
      setStatus('Disconnected')
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leads</Text>
      <Text style={styles.status}>{status}</Text>
      <FlatList
        data={leads}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.info}>{item.email}</Text>
            <Text style={styles.info}>{item.phone}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  status: {
    color: '#ffd54f',
    marginBottom: 12,
  },
  card: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  info: {
    color: '#ccc',
  },
})