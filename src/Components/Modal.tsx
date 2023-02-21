import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import MetamaskLogo from "../images/metamask-ico.png";
import TrustWalletLogo from "../images/trust-wallet.png";


export default function ModalExample({
  handleClose,
  show,
  onClickConnectMM,
  onClickConnectTW}: any) {

  return (
    <>
      
      <Modal show={show} onHide={handleClose} >
        <Modal.Header className="modal_window" closeButton>
          <Modal.Title className="welcome__wallet">Choose your wallet </Modal.Title>
        </Modal.Header>
        <Modal.Footer className="d-flex justify-content-center modal_window">
          <button type="button"
            className="mod_but  borderm1" onClick={onClickConnectMM}><img src={MetamaskLogo} className="welcome__metamask-ico " /></button>
          <button type="button"
            className="mod_but borderm1" onClick={onClickConnectTW}><img src={TrustWalletLogo} className="welcome__metamask-ico " /></button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
