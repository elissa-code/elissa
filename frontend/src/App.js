import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // You can add some basic CSS if you want
import { Form } from 'react-router-dom';
const API_URL = 'http://localhost:3001/api'; // Match your backend port

function App() {
  // --- Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState(''); // For displaying signup/login messages

  // --- Library Data States ---
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);

  // --- State for New Items ---
  const [newBook, setNewBook] = useState({ title: '', author: '', ISBN: '', genre: '', publication_year: '', publisher_id: '', supplier_id: '' });
  const [newMember, setNewMember] = useState({ name: '', type: 'Student', contact_info: '' });
  const [newPublisher, setNewPublisher] = useState({ name: '', contact_info: '' });
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_info: '' });

  // --- State for Editing ---
  const [editingBookId, setEditingBookId] = useState(null);
  const [editedBook, setEditedBook] = useState({ title: '', author: '', ISBN: '', genre: '', publication_year: '', publisher_id: '', supplier_id: '' });
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editedMember, setEditedMember] = useState({ name: '', type: 'Student', contact_info: '' });
  const [editingPublisherId, setEditingPublisherId] = useState(null);
  const [editedPublisher, setEditedPublisher] = useState({ name: '', contact_info: '' });
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [editedSupplier, setEditedSupplier] = useState({ name: '', contact_info: '' });

  // --- Fetch Data ---
  // Fetch data ONLY if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchBooks();
      fetchMembers();
      fetchPublishers();
      fetchSuppliers();
      fetchBorrowings();
    }
  }, [isLoggedIn]); // Dependency array: refetch when isLoggedIn changes

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_URL}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Handle error, e.g., show a message
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await axios.get(`${API_URL}/publishers`);
      setPublishers(response.data);
    } catch (error) {
      console.error('Error fetching publishers:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get(`${API_URL}/borrowings`);
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  };

  // --- Authentication Handlers ---
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/signup`, { username, password });
      setAuthMessage(response.data.message);
      // Clear form after successful signup
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
      setAuthMessage(error.response ? error.response.data.message : 'Signup failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      setAuthMessage(response.data.message);
      setIsLoggedIn(true); // Set logged in state
      // Clear form after successful login
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setAuthMessage(error.response ? error.response.data.message : 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthMessage('Logged out');
    // Clear any sensitive data if needed
    setBooks([]);
    setMembers([]);
    setPublishers([]);
    setSuppliers([]);
    setBorrowings([]);
  };

  // --- Handle Form Changes (for adding/editing library items) ---
  const handleNewBookChange = (e) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleNewMemberChange = (e) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleNewPublisherChange = (e) => {
    setNewPublisher({ ...newPublisher, [e.target.name]: e.target.value });
  };

  const handleNewSupplierChange = (e) => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  const handleEditedBookChange = (e) => {
    setEditedBook({ ...editedBook, [e.target.name]: e.target.value });
  };

  const handleEditedMemberChange = (e) => {
    setEditedMember({ ...editedMember, [e.target.name]: e.target.value });
  };

  const handleEditedPublisherChange = (e) => {
    setEditedPublisher({ ...editedPublisher, [e.target.name]: e.target.value });
  };

  const handleEditedSupplierChange = (e) => {
    setEditedSupplier({ ...editedSupplier, [e.target.name]: e.target.value });
  };


  // --- Add Operations ---
  const addBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/books`, newBook);
      setNewBook({ title: '', author: '', ISBN: '', genre: '', publication_year: '', publisher_id: '', supplier_id: '' });
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book'); // Simple error feedback
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/members`, newMember);
      setNewMember({ name: '', type: 'Student', contact_info: '' });
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };

  const addPublisher = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/publishers`, newPublisher);
      setNewPublisher({ name: '', contact_info: '' });
      fetchPublishers(); // Refresh the list
    } catch (error) {
      console.error('Error adding publisher:', error);
      alert('Failed to add publisher');
    }
  };

  const addSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/suppliers`, newSupplier);
      setNewSupplier({ name: '', contact_info: '' });
      fetchSuppliers(); // Refresh the list
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier');
    }
  };

  // --- Delete Operations ---
  const deleteBook = async (bookId) => {
    try {
      await axios.delete(`${API_URL}/books/${bookId}`);
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const deleteMember = async (memberId) => {
    try {
      await axios.delete(`${API_URL}/members/${memberId}`);
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
    }
  };

  const deletePublisher = async (publisherId) => {
    try {
      await axios.delete(`${API_URL}/publishers/${publisherId}`);
      fetchPublishers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting publisher:', error);
      alert('Failed to delete publisher');
    }
  };

  const deleteSupplier = async (supplierId) => {
    try {
      await axios.delete(`${API_URL}/suppliers/${supplierId}`);
      fetchSuppliers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  // --- Update Operations (Basic Implementation) ---

  const startEditingBook = (book) => {
    setEditingBookId(book.book_id);
    setEditedBook({ ...book }); // Copy book data to the edit state
  };

  const cancelEditingBook = () => {
    setEditingBookId(null);
    setEditedBook({ title: '', author: '', ISBN: '', genre: '', publication_year: '', publisher_id: '', supplier_id: '' });
  };

  const updateBook = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/books/${editingBookId}`, editedBook);
      cancelEditingBook(); // Exit editing mode
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Failed to update book');
    }
  };

  const startEditingMember = (member) => {
    setEditingMemberId(member.member_id);
    setEditedMember({ ...member });
  };

  const cancelEditingMember = () => {
    setEditingMemberId(null);
    setEditedMember({ name: '', type: 'Student', contact_info: '' });
  };

  const updateMember = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/members/${editingMemberId}`, editedMember);
      cancelEditingMember();
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member');
    }
  };

  const startEditingPublisher = (publisher) => {
    setEditingPublisherId(publisher.publisher_id);
    setEditedPublisher({ ...publisher });
  };

  const cancelEditingPublisher = () => {
    setEditingPublisherId(null);
    setEditedPublisher({ name: '', contact_info: '' });
  };

  const updatePublisher = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/publishers/${editingPublisherId}`, editedPublisher);
      cancelEditingPublisher();
      fetchPublishers();
    } catch (error) {
      console.error('Error updating publisher:', error);
      alert('Failed to update publisher');
    }
  };

  const startEditingSupplier = (supplier) => {
    setEditingSupplierId(supplier.supplier_id);
    setEditedSupplier({ ...supplier });
  };

  const cancelEditingSupplier = () => {
    setEditingSupplierId(null);
    setEditedSupplier({ name: '', contact_info: '' });
  };

  const updateSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/suppliers/${editingSupplierId}`, editedSupplier);
      cancelEditingSupplier();
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Failed to update supplier');
    }
  };


  return (
    <div className="App">
      <h1>Library Management System</h1>

      {!isLoggedIn ? (
        // --- Authentication Forms (Show when not logged in) ---
        <div>
          <h2>Signup or Login</h2>
          <form onSubmit={handleLogin}>
            <h3>Login</h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <button type="submit">Login</button>
          </form>

          <form onSubmit={handleSignup}>
             <h3>Signup</h3>
             <input
               type="text"
               placeholder="Username"
               value={username}
               onChange={handleUsernameChange}
               required
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={handlePasswordChange}
               required
             />
             <button type="submit">Signup</button>
           </form>

          {authMessage && <p>{authMessage}</p>}
        </div>
      ) : (
        // --- Main Library Content (Show when logged in) ---
        <div>
          <h2>Welcome!</h2>
          <button onClick={handleLogout}>Logout</button>

          {/* Add New Book Form */}
          <h2>Add New Book</h2>
          <form onSubmit={addBook}>
            <input type="text" name="title" placeholder="Title" value={newBook.title} onChange={handleNewBookChange} required />
            <input type="text" name="author" placeholder="Author" value={newBook.author} onChange={handleNewBookChange} />
            <input type="text" name="ISBN" placeholder="ISBN" value={newBook.ISBN} onChange={handleNewBookChange} />
            <input type="text" name="genre" placeholder="Genre" value={newBook.genre} onChange={handleNewBookChange} />
            <input type="number" name="publication_year" placeholder="Publication Year" value={newBook.publication_year} onChange={handleNewBookChange} />
            {/* Use select for publisher and supplier IDs */}
            <select name="publisher_id" value={newBook.publisher_id} onChange={handleNewBookChange}>
               <option value="">Select Publisher</option>
               {publishers.map(p => <option key={p.publisher_id} value={p.publisher_id}>{p.name}</option>)}
            </select>
            <select name="supplier_id" value={newBook.supplier_id} onChange={handleNewBookChange}>
               <option value="">Select Supplier</option>
               {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
            </select>
            <button type="submit">Add Book</button>
          </form>

           {/* Add New Member Form */}
          <h2>Add New Member</h2>
          <form onSubmit={addMember}>
            <input type="text" name="name" placeholder="Name" value={newMember.name} onChange={handleNewMemberChange} required />
            <select name="type" value={newMember.type} onChange={handleNewMemberChange}>
               <option value="Student">Student</option>
               <option value="Teacher">Teacher</option>
            </select>
            <input type="text" name="contact_info" placeholder="Contact Info" value={newMember.contact_info} onChange={handleNewMemberChange} />
            <button type="submit">Add Member</button>
          </form>

           {/* Add New Publisher Form */}
          <h2>Add New Publisher</h2>
          <form onSubmit={addPublisher}>
            <input type="text" name="name" placeholder="Publisher Name" value={newPublisher.name} onChange={handleNewPublisherChange} required />
            <input type="text" name="contact_info" placeholder="Contact Info" value={newPublisher.contact_info} onChange={handleNewPublisherChange} />
            <button type="submit">Add Publisher</button>
          </form>

           {/* Add New Supplier Form */}
          <h2>Add New Supplier</h2>
          <form onSubmit={addSupplier}>
            <input type="text" name="name" placeholder="Supplier Name" value={newSupplier.name} onChange={handleNewSupplierChange} required />
            <input type="text" name="contact_info" placeholder="Contact Info" value={newSupplier.contact_info} onChange={handleNewSupplierChange} />
            <button type="submit">Add Supplier</button>
          </form>


          {/* Book List */}
          <h2>Books</h2>
          <ul>
            {books.map(book => (
              <li key={book.book_id}>
                {editingBookId === book.book_id ? (
                  // Edit form for the selected book
                  <form onSubmit={updateBook}>
                     <input type="text" name="title" value={editedBook.title} onChange={handleEditedBookChange} required />
                     <input type="text" name="author" value={editedBook.author} onChange={handleEditedBookChange} />
                     <input type="text" name="ISBN" value={editedBook.ISBN} onChange={handleEditedBookChange} />
                     <input type="text" name="genre" value={editedBook.genre} onChange={handleEditedBookChange} />
                     <input type="number" name="publication_year" value={editedBook.publication_year} onChange={handleEditedBookChange} />
                     <select name="publisher_id" value={editedBook.publisher_id} onChange={handleEditedBookChange}>
                        <option value="">Select Publisher</option>
                        {publishers.map(p => <option key={p.publisher_id} value={p.publisher_id}>{p.name}</option>)}
                     </select>
                     <select name="supplier_id" value={editedBook.supplier_id} onChange={handleEditedBookChange}>
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
                     </select>
                     <button type="submit">Save</button>
                     <button type="button" onClick={cancelEditingBook}>Cancel</button>
                  </form>
                ) : (
                  // Display mode
                  <>
                    {book.title} by {book.author} (ISBN: {book.ISBN}) [Publisher: {book.publisher_name || 'N/A'}, Supplier: {book.supplier_name || 'N/A'}]
                    <button onClick={() => startEditingBook(book)}>Edit</button>
                    <button onClick={() => deleteBook(book.book_id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>

           {/* Member List */}
          <h2>Members</h2>
          <ul>
            {members.map(member => (
               <li key={member.member_id}>
                {editingMemberId === member.member_id ? (
                  // Edit form for the selected member
                  <form onSubmit={updateMember}>
                     <input type="text" name="name" value={editedMember.name} onChange={handleEditedMemberChange} required />
                     <select name="type" value={editedMember.type} onChange={handleEditedMemberChange}>
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                     </select>
                     <input type="text" name="contact_info" value={editedMember.contact_info} onChange={handleEditedMemberChange} />
                     <button type="submit">Save</button>
                     <button type="button" onClick={cancelEditingMember}>Cancel</button>
                  </form>
                ) : (
                  // Display mode
                  <>
                    {member.name} ({member.type}) - {member.contact_info}
                    <button onClick={() => startEditingMember(member)}>Edit</button>
                    <button onClick={() => deleteMember(member.member_id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>

           {/* Publisher List */}
          <h2>Publishers</h2>
          <ul>
            {publishers.map(publisher => (
               <li key={publisher.publisher_id}>
                {editingPublisherId === publisher.publisher_id ? (
                  // Edit form for the selected publisher
                  <form onSubmit={updatePublisher}>
                     <input type="text" name="name" value={editedPublisher.name} onChange={handleEditedPublisherChange} required />
                     <input type="text" name="contact_info" value={editedPublisher.contact_info} onChange={handleEditedPublisherChange} />
                     <button type="submit">Save</button>
                     <button type="button" onClick={cancelEditingPublisher}>Cancel</button>
                  </form>
                ) : (
                  // Display mode
                  <>
                    {publisher.name} - {publisher.contact_info}
                    <button onClick={() => startEditingPublisher(publisher)}>Edit</button>
                    <button onClick={() => deletePublisher(publisher.publisher_id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>

           {/* Supplier List */}
          <h2>Suppliers</h2>
          <ul>
            {suppliers.map(supplier => (
               <li key={supplier.supplier_id}>
                {editingSupplierId === supplier.supplier_id ? (
                  // Edit form for the selected supplier
                  <form onSubmit={updateSupplier}>
                     <input type="text" name="name" value={editedSupplier.name} onChange={handleEditedSupplierChange} required />
                     <input type="text" name="contact_info" value={editedSupplier.contact_info} onChange={handleEditedSupplierChange} />
                     <button type="submit">Save</button>
                     <button type="button" onClick={cancelEditingSupplier}>Cancel</button>
                  </form>
                ) : (
                  // Display mode
                  <>
                    {supplier.name} - {supplier.contact_info}
                    <button onClick={() => startEditingSupplier(supplier)}>Edit</button>
                    <button onClick={() => deleteSupplier(supplier.supplier_id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>

           {/* Borrowing List (Read Only) */}
          <h2>Borrowings</h2>
          <p>Note: Full CRUD for Borrowings is more complex and omitted here for simplicity.</p>
          <ul>
            {borrowings.map(borrowing => (
              <li key={borrowing.borrowing_id}>
                 {/* Display book and member names from the joined data */}
                Borrowing ID: {borrowing.borrowing_id}, Book: {borrowing.book_title}, Member: {borrowing.member_name}, Borrow Date: {borrowing.borrow_date}, Return Date: {borrowing.return_date || 'Not Returned'}
              </li>
            ))}
          </ul>

        </div>
      )}
    </div>
  );
}

export default App;