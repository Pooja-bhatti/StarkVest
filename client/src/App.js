import logo from './logo.svg';
import './App.css';
import {Routes,Route} from 'react-router-dom'
import { Home } from './components/Home';
import { Navbar } from './components/Navbar';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Details } from './components/Details';
import { Buy } from './components/Buy';
import { Profile } from './components/Profile';
function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/> 
        <Route path='/portfolio' element={<Portfolio/>}/>
        <Route path="/stock-details" element={<Details/>}/>
        <Route path='/buy' element={<Buy/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </>
  );
}

export default App;
