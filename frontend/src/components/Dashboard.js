import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
} from '../store/slices/documentSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.document);
  const [open, setOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    language: 'javascript',
  });

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewDocument({ title: '', language: 'javascript' });
  };

  const handleCreate = () => {
    dispatch(createDocument({ ...newDocument, content: '' }));
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      dispatch(deleteDocument(id));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Documents
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          New Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {doc.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Language: {doc.language}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last updated: {new Date(doc.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/editor/${doc._id}`)}
                >
                  Open
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(doc._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newDocument.title}
            onChange={(e) =>
              setNewDocument({ ...newDocument, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Language"
            fullWidth
            select
            SelectProps={{ native: true }}
            value={newDocument.language}
            onChange={(e) =>
              setNewDocument({ ...newDocument, language: e.target.value })
            }
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            color="primary"
            disabled={!newDocument.title}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 