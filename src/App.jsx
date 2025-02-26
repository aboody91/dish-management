import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  CssBaseline,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  styled,
  Fab,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { createClient } from '@supabase/supabase-js';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Input = styled('input')({
  display: 'none',
});

const GreenButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText('#4CAF50'),
  backgroundColor: '#4CAF50',
  '&:hover': {
    backgroundColor: '#388E3C',
  },
}));

const DropzoneContainer = styled('div')({
  border: '2px dashed #ccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
});

const supabaseUrl = 'https://kjobwhthqijeyhqrpnpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2J3aHRocWlqZXlocXJwbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NDUzMTEsImV4cCI6MjA1NjEyMTMxMX0.qxgXsJPHFyPw8qQ2uiGl571C-m7yPq7KnGmvl_bMm5Q';
const supabase = createClient(supabaseUrl, supabaseKey);

const storageBucket = 'dish-images'; // Replace with your bucket name
const IMGUR_CLIENT_ID = '894bb2b1e2c13a7';

function App() {
  const [logo, setLogo] = useState('');
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [isDishDialogOpen, setIsDishDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDish, setNewDish] = useState({
    id: '',
    name: '',
    category: '',
    recipe: '',
    preparation: '',
    photo_url: null,
  });
  const [newCategory, setNewCategory] = useState('');
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [adminTabValue, setAdminTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchDishes();
    await fetchCategories();
    await fetchLogo();
  };

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*');

    if (error) {
      console.error('Error fetching dishes:', error);
    } else {
      setDishes(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchLogo = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('logo_url')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching logo:', error);
    } else {
      setLogo(data?.logo_url || '');
    }
  };

  const handleOpenDishDialog = (dish) => {
    setSelectedDish(dish);
    setIsDishDialogOpen(true);
  };

  const handleCloseDishDialog = () => {
    setIsDishDialogOpen(false);
  };

  const handleInputChange = (e) => {
    setNewDish({ ...newDish, [e.target.name]: e.target.value });
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios({
        method: 'post',
        url: 'https://api.imgur.com/3/image',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        data: formData,
        onUploadProgress: (progressEvent) => {
          const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(percentComplete);
        },
      });

      if (response.data.success) {
        console.log("Imgur upload response:", response.data);
        return response.data.data.link;
      } else {
        console.error('Imgur upload failed:', response.data.data.error);
        setSnackbarMessage(`Imgur upload failed: ${response.data.data.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return null;
      }
    } catch (error) {
      console.error('Error uploading to Imgur:', error);
      setSnackbarMessage(`Imgur upload error: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePhotoChange = async (file) => {
    if (!file) return;
    try {
      const photoURL = await uploadImage(file);
      if (photoURL) {
        setNewDish({ ...newDish, photo_url: photoURL });
         console.log("New dish state with photo URL:", { ...newDish, photo_url: photoURL });
      }
    } catch (error) {
      console.error("Error in handlePhotoChange:", error);
      setSnackbarMessage(`Photo change failed: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAddDish = async () => {
    const id = uuidv4();
    const dishToAdd = { ...newDish, id: id };

    const { data, error } = await supabase
      .from('dishes')
      .insert([dishToAdd])
      .select();

    if (error) {
      console.error('Error adding dish:', error);
       setSnackbarMessage(`Add dish failed: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    } else {
      setDishes([...dishes, data[0]]);
      setNewDish({ id: '', name: '', category: '', recipe: '', preparation: '', photo_url: null });
      setSnackbarMessage('Dish has been added!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleOpenEditDialog = (dish) => {
    setNewDish({ ...dish });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleUpdateDish = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .update(newDish)
      .eq('id', newDish.id)
      .select();

    if (error) {
      console.error('Error updating dish:', error);
       setSnackbarMessage(`Update dish failed: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    } else {
      setIsEditDialogOpen(false);
      setDishes(dishes.map(dish => (dish.id === newDish.id ? data[0] : dish)));
      setSnackbarMessage('Dish updated!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteDish = async (id) => {
    const dishToDelete = dishes.find(dish => dish.id === id);
    // Imgur doesn't support deleting images without user authentication
    //if (dishToDelete?.photo_url) {
    //  const oldFilePath = dishToDelete.photo_url.replace(`https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/`, '').split('?')[0];
    //  await deleteFile(`images/${oldFilePath}`);
    //}

    const { data, error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dish:', error);
       setSnackbarMessage(`Delete dish failed: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    } else {
      setDishes(dishes.filter(dish => dish.id !== id));
      setSnackbarMessage('Dish deleted!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleAddCategory = async () => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCategory }]);

    if (error) {
      console.error('Error adding category:', error);
    } else {
      setNewCategory('');
      setSnackbarMessage('Category added!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchCategories();
    }
  };

  const handleLogoUpload = async (file) => {
   setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios({
        method: 'post',
        url: 'https://api.imgur.com/3/image',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        data: formData,
        onUploadProgress: (progressEvent) => {
          const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(percentComplete);
        },
      });

      if (response.data.success) {
        console.log("Imgur upload response:", response.data);
        const logoURL = response.data.data.link;

          // Update the logo URL in the site_settings table
          const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .upsert([{ id: '11111111-1111-1111-1111-111111111111', logo_url: logoURL }], { onConflict: 'id' }); // Fixed UUID

          if (settingsError) {
            console.error('Error updating logo URL:', settingsError);
             setSnackbarMessage(`Logo upload failed: ${settingsError.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          } else {
            setLogo(logoURL);
            fetchLogo();
          }
      } else {
        console.error('Imgur upload failed:', response.data.data.error);
        setSnackbarMessage(`Imgur upload failed: ${response.data.data.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error uploading to Imgur:', error);
      setSnackbarMessage(`Imgur upload error: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        setSnackbarMessage(`Failed to delete category: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setCategories(categories.filter(category => category.id !== categoryId));
        setSnackbarMessage('Category deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbarMessage(`Error deleting category: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const {getRootProps: getDishRootProps, getInputProps: getDishInputProps, open: openDishImage} = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      handlePhotoChange(acceptedFiles[0]);
    },
    multiple: false
  });

  const {getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, open: openLogoImage} = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      handleLogoUpload(acceptedFiles[0]);
    },
    multiple: false
  });

  const handleOpenImageDialog = (image) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setIsImageDialogOpen(false);
    setSelectedImage(null);
  };

  const handleAdminTabChange = (event, newValue) => {
    setAdminTabValue(newValue);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CssBaseline>
      <AppBar position="static">
        <Toolbar>
          {logo && <img src={logo} alt="Logo" style={{ height: '50px', marginRight: '16px' }} />}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dish Management
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/manage">Manage</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={
            <>
              <Typography variant="h4" gutterBottom>
                Dishes
              </Typography>
              <TextField
                label="Search Dishes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Grid container spacing={2}>
                {filteredDishes.map((dish) => (
                  <Grid item xs={12} sm={6} md={4} key={dish.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => handleOpenDishDialog(dish)}>
                      <CardMedia
                        component="img"
                        height="194"
                        image={dish.photo_url}
                        alt={dish.name}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                          {dish.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dish.category}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Dialog
                open={isDishDialogOpen}
                onClose={handleCloseDishDialog}
                maxWidth="md" // Make the dialog wider
                fullWidth
              >
                <DialogTitle>{selectedDish?.name}</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      {selectedDish?.photo_url && (
                        <img
                          src={selectedDish.photo_url}
                          alt={selectedDish?.name}
                          style={{ width: '100%', marginBottom: '16px' }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">Category: {selectedDish?.category}</Typography>
                      <Box mt={2}>
                        <Typography variant="subtitle1">Recipe:</Typography>
                        <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                          {selectedDish?.recipe}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="subtitle1">Preparation:</Typography>
                        <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                          {selectedDish?.preparation}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDishDialog}>Close</Button>
                </DialogActions>
              </Dialog>
            </>
          } />
          <Route path="/manage" element={
            <Container>
              <Typography variant="h4" gutterBottom>
                Manage Page
              </Typography>
              <Tabs value={adminTabValue} onChange={handleAdminTabChange} aria-label="admin tabs">
                <Tab label="Add New Dish" />
                <Tab label="Manage Site" />
                <Tab label="Manage Dishes" />
              </Tabs>
              {adminTabValue === 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6">Add New Dish</Typography>
                  <TextField
                    label="Name"
                    name="name"
                    value={newDish.name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      value={newDish.category}
                      label="Category"
                      onChange={handleInputChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Recipe"
                    name="recipe"
                    value={newDish.recipe}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                  />
                  <TextField
                    label="Preparation"
                    name="preparation"
                    value={newDish.preparation}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                  />
                   <DropzoneContainer {...getDishRootProps()} >
                      <input {...getDishInputProps()} />
                      <Typography>Drag and drop an image here, or click to select one</Typography>
                    </DropzoneContainer>
                    {uploading && <LinearProgress variant="determinate" value={uploadProgress} />}
                  <GreenButton variant="contained" onClick={handleAddDish} sx={{ mt: 2 }}>
                    Add Dish
                  </GreenButton>
                </Box>
              )}
              {adminTabValue === 1 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6">Add New Category</Typography>
                  <TextField
                    label="Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button variant="contained" color="primary" onClick={handleAddCategory}>
                    Add Category
                  </Button>
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Upload Logo</Typography>
                     <DropzoneContainer {...getLogoRootProps()} >
                      <input {...getLogoInputProps()} />
                      <Typography>Drag and drop an image here, or click to select one</Typography>
                    </DropzoneContainer>
                     {uploading && <LinearProgress variant="determinate" value={uploadProgress} />}
                  </Box>
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Manage Categories</Typography>
                    {categories.map((category) => (
                      <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography>{category.name}</Typography>
                        <IconButton aria-label="edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => handleDeleteCategory(category.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {adminTabValue === 2 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Manage Dishes
                  </Typography>
                  <Grid container spacing={2}>
                    {dishes.map((dish) => (
                      <Grid item xs={12} sm={6} md={4} key={dish.id}>
                        <Card>
                          {dish.photo_url && (
                            <CardMedia
                              component="img"
                              height="140"
                              image={dish.photo_url}
                              alt={dish.name}
                              style={{cursor: 'pointer'}}
                              onClick={() => handleOpenImageDialog(dish.photo_url)}
                            />
                          )}
                          <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                              {dish.name}
                            </Typography>
                            <Box>
                              <IconButton onClick={() => handleOpenEditDialog(dish)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteDish(dish.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
                <DialogTitle>Edit Dish</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
                     <Grid item xs={12} md={6}>
                      <TextField
                        label="Name"
                        name="name"
                        value={newDish.name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          id="category"
                          name="category"
                          value={newDish.category}
                          label="Category"
                          onChange={handleInputChange}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <DropzoneContainer {...getDishRootProps()} >
                        <input {...getDishInputProps()} />
                        <Typography>Drag and drop an image here, or click to select one</Typography>
                      </DropzoneContainer>
                      {uploading && <LinearProgress variant="determinate" value={uploadProgress} />}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Recipe"
                        name="recipe"
                        value={newDish.recipe}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                      />
                      <TextField
                        label="Preparation"
                        name="preparation"
                        value={newDish.preparation}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseEditDialog}>Cancel</Button>
                  <Button onClick={handleUpdateDish} color="primary">Update</Button>
                </DialogActions>
              </Dialog>
            </Container>
          } />
        </Routes>
        <Dialog open={isImageDialogOpen} onClose={handleCloseImageDialog}>
          <DialogContent>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full Size"
                style={{ width: '100%' }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseImageDialog}>Close</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </CssBaseline>
  );
}

export default App;
