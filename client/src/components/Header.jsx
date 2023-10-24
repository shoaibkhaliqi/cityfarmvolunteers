import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from "reactstrap";

function Header() {
    return (
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">
          <img src="" alt="Logo" />
        </NavbarBrand>
        <NavbarBrand href="/">City Farm</NavbarBrand>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="#home">Home</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#about">Sessions</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#contact">My Sesssions</NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
  
  export default Header;
  