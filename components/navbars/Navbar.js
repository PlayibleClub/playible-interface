import Link from 'next/link'
import { slide as Menu } from 'react-burger-menu'

var styles = {
    bmBurgerButton: {
      position: 'fixed',
      width: '20px',
      height: '15px',
      left: '42px',
      top: '50px'
    },
    bmBurgerBars: {
      background: '#ffffff'
    },
    bmBurgerBarsHover: {
      background: '#a90000'
    },
    bmCrossButton: {
      height: '24px',
      width: '24px'
    },
    bmCross: {
      background: '#bdc3c7'
    },
    bmMenuWrap: {
      position: 'fixed',
      height: '100%'
    },
    bmMenu: {
      background: '#000000',
      padding: '2.5em 1.5em 0',
      fontSize: '1.15em'
    },
    bmMorphShape: {
      fill: '#000000'
    },
    bmItemList: {
      color: '#b8b7ad',
      padding: '0.8em'
    },
    bmItem: {
      display: 'flex',
      flexDirection: 'column'
    },
    bmOverlay: {
      background: 'rgba(0, 0, 0, 0.3)'
    }
  }

const Navbar = () => {
  return (
    <div>
      <Menu styles={ styles } customBurgerIcon={ <img src="images/Hamburger.png" /> }>
          <a id="home" className="menu-item"><Link href="/">HOME</Link></a>
          <a id="portfolio" className="menu-item"><Link href="/Portfolio">PORTFOLIO</Link></a>
          <a id="packs" className="menu-item"><Link href="/Packs">PACKS</Link></a>
          <a id="marketplace" className="menu-item"><Link href="/Marketplace">MARKETPLACE</Link></a>
          <a id="play" className="menu-item"><Link href="/Play">PLAY</Link></a>
          <a id="contract" className="menu-item"><Link href="/ContractInteraction">(ContractInteraction)</Link></a>
      </Menu>
    </div>
  );
};

export default Navbar;