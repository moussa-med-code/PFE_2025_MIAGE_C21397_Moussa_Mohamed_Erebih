import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomeHeader, HomeContent , LoginForm , SignupForm , HomeFooter , VerificationEmailPage , DemandeReinitialisation , ReinitialisationMotDePasse , ClientProfile , FreelancerProfile , AdminProfile , EditFreelancerProfile , EditClientProfile , EditAdminProfile , ClientDashboard , FreelancerDashboard , AdminDashboard} from './components';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/signup" element={<SignupForm/>}/>
        <Route path="/verification-email" element={<VerificationEmailPage/>}/>
        <Route path="/client/profile" element={<ClientProfile />} />
        <Route path="/freelancer/profile" element={<FreelancerProfile />} />
        <Route path="/administrateur/profile" element={<AdminProfile />} />
        <Route path="/mot-de-passe/demande-reinitialisation" element={<DemandeReinitialisation />} />
        <Route path="/mot-de-passe/reinitialiser/:jeton" element={<ReinitialisationMotDePasse />} />
        <Route path="/freelancer/profil/edit" element={<EditFreelancerProfile />} />
        <Route path="/client/profil/edit" element={<EditClientProfile />} />
        <Route path="/admin/profil/edit" element={<EditAdminProfile />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
        <Route path="/administrateur/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

const Home = ()=>{
  return(
    <>
    <HomeHeader/>
    <HomeContent/>
    <HomeFooter/>
    </>
  )
}

export default App