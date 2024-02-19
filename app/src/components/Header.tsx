import Logo from '../public/FancyLogo.png';
import "../styles/Header.css"

export default function Header() {
  return (
    <header className="header">

      <div className="logo">
        <img src={Logo} alt="logo" />
      </div>

      <div className="title">
        <h2></h2> 
        <h1>Court Visionaries</h1> 
      </div>

    </header>
  );
}
  
