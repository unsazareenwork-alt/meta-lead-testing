require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, { cors: { origin: '*' } });
const leads = [];

io.on('connection', (socket) => {
  console.log('app connected:', socket.id);
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('server is running');
});

app.get('/leads', (req, res) => {
  res.json(leads);
});

app.get('/test-lead', (req, res) => {
  const lead = {
    id: Date.now().toString(),
    name: 'unsa zareen',
    email: 'test@example.com',
    phone: '+911234567890',
    createdAt: new Date().toISOString()
  };
  leads.unshift(lead);
  io.emit('new-lead', lead);
  res.json(lead);
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

async function fetchLead(leadgenId) {
  try {
    const url = `https://graph.facebook.com/v26.0/${leadgenId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('Graph API error:', data.error);
      return null;
    }

    const fieldData = data.field_data || [];
    const getField = (name) => {
      const field = fieldData.find((f) => f.name === name);
      return field ? field.values[0] : '';
    };

    return {
      id: leadgenId,
      name: getField('full_name') || getField('name') || 'Unknown',
      email: getField('email') || '',
      phone: getField('phone_number') || getField('phone') || '',
      createdAt: data.created_time || new Date().toISOString(),
    };
  } catch (err) {
    console.log('fetch error:', err.message);
    return null;
  }
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entries = req.body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field === 'leadgen') {
        const leadgenId = change.value.leadgen_id;
        const lead = await fetchLead(leadgenId);
        if (lead) {
          leads.unshift(lead);
          io.emit('new-lead', lead);
          console.log('sent new lead to app');
        }
      }
    }
  }
});

server.listen(process.env.PORT, () => {
  console.log('server started on port', process.env.PORT);
});