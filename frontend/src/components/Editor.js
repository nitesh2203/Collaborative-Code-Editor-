import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import { updateDocument } from '../store/slices/documentSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CodeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documents } = useSelector((state) => state.document);
  const { user } = useSelector((state) => state.auth);
  const [document, setDocument] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const currentDoc = documents.find((doc) => doc._id === id);
    if (currentDoc) {
      setDocument(currentDoc);
    } else {
      navigate('/');
    }
  }, [id, documents, navigate]);

  useEffect(() => {
    if (document) {
      const newSocket = io(API_URL);
      setSocket(newSocket);

      newSocket.emit('join-document', id);

      newSocket.on('code-update', (data) => {
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          model.setValue(data.content);
        }
      });

      newSocket.on('receive-message', (data) => {
        setMessages((prev) => [...prev, data]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [document, id]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value) => {
    if (socket) {
      socket.emit('code-change', {
        documentId: id,
        content: value,
      });
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getValue();
      dispatch(updateDocument({ id, content }));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const messageData = {
        documentId: id,
        user: user.username,
        text: message,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send-message', messageData);
      setMessage('');
    }
  };

  if (!document) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, height: 'calc(100vh - 100px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={9}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{document.title}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <Editor
                height="100%"
                defaultLanguage={document.language}
                defaultValue={document.content}
                theme="vs-dark"
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </Box>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Chat</Typography>
            </Box>
            <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={msg.text}
                      secondary={`${msg.user} - ${new Date(
                        msg.timestamp
                      ).toLocaleTimeString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <form onSubmit={handleSendMessage}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </form>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CodeEditor; 