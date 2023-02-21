import { Navbar, Nav, Container } from "react-bootstrap";
import { Outlet, Link } from "react-router-dom";
import Logo from '../images/Logo2.png';
import ModalExample from "./Modal"
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Button from 'react-bootstrap/Button';

declare let window: any

interface Props { setProviderUrl: (value: string | undefined ) => void}

const NavBar = ({ setProviderUrl }: Props) => {
    const [currentAccount, setCurrentAccount] = useState<string | undefined>()
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

   
    const getAddressSlice = (address: string | undefined) => {
        if (!address) {
            return
        } else {
            return address?.slice(0, 5) + "..." + address?.slice(38, 42);
        }
    }

    const onClickConnectMM = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            if (!window.ethereum) {
                alert("Please install Metamask");
                console.log("Please install Metamask")
                return
            }
            e.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            setCurrentAccount(signerAddress);
            if (signerAddress) {
                handleClose();
            }
            setProviderUrl(provider.connection.url)
        } catch (err: any) {
            console.log(err.message);
        }
    }

    const onClickConnectTW = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            if (!window.trustwallet) {
                alert("Please install Trust Wallet");
                console.log("Please install Trust Wallet")
                return
            }
            e.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.trustwallet)
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            setCurrentAccount(signerAddress);
            if (signerAddress) {
                handleClose();
            }
            setProviderUrl(provider.connection.url)
        } catch (err: any) {
            console.log(err.message);
        }
    }

    return (
        <>
            <header>
                <Navbar className="navBg" variant="dark" expand="lg">
                    <Container >
                        <Navbar.Brand as={Link} to="/" >
                            <img
                                src={Logo}
                                height="50"
                                width="80"
                                className="d-inline alighn-top"
                                alt="Logo"
                            />{" "}
                            Rock, Paper, Scissors
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link as={Link} to="/SC_BNB">Play with SC for BNB</Nav.Link>
                                <Nav.Link as={Link} to="/SC_BUSD">Play with SC for BUSD</Nav.Link>
                                <Nav.Link as={Link} to="/PVP_BNB">PVP for BNB</Nav.Link>
                                <Nav.Link as={Link} to="/PVP_BUSD">PVP for BUSD</Nav.Link>
                            </Nav>
                            <div>
                                {currentAccount
                                    ? <Button variant="primary" title={currentAccount} disabled>connected{" "}
                                        {getAddressSlice(currentAccount)}
                                    </Button>
                                    : <Button variant="primary" title={currentAccount} onClick={handleShow}>
                                        Connect Wallet
                                    </Button>}
                                <ModalExample
                                    handleClose={handleClose}
                                    show={show}
                                    onClickConnectMM={onClickConnectMM}
                                    onClickConnectTW={onClickConnectTW} />
                            </div>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>
            <main>
                <Outlet></Outlet>
            </main>
            <footer>

            </footer>
        </>
    )
}
export default NavBar;