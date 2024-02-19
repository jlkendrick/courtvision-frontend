import Logo from '../public/Logo_transparent_outer.png';
import "../styles/App.css"

export default function Header() {
  return (
    <nav className="navbar navbar-light bg-custom">
      <a className="navbar-brand" href="#">
        <img src={Logo} width="200" height="150" alt="logo" />
        Court Visionaries
      </a>
      {/* Other navbar content can be added here */}
    </nav>
  );
}
  
