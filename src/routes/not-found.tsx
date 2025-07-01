import { useLocation } from "preact-iso/router";
import Footer from "../components/footer";

const NotFound = () => {
  const location = useLocation();

  return (
    <div
      className="default-layout"
      style={{
        height: "calc(100vh - var(--footer-size))",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span className="primary-fg" style={{ fontSize: "xxx-large" }}>
        Oops!
      </span>

      <p
        style={{
          fontStyle: "italic",
          textAlign: "center",
          color: "var(--secondary-fg)",
        }}
      >
        This page does not exist. <br /> Return to the app using the home
        button.
      </p>

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => location.route("/")}
        >
          <i className="material-icons">home</i>
        </a>
      </Footer>
    </div>
  );
};

export default NotFound;
