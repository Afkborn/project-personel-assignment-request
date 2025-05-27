
import logo from "../../assets/logo300.png";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <h1 style={styles.message}>
        Böyle bir URL yok gibi gözüküyor <br /> <br /> Güvenli bir yere gitmek
        istersen
        <a href="/"> buraya tıkla</a>
      </h1>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
  },
  logo: {
    width: "150px",
    marginBottom: "20px",
  },
  message: {
    fontSize: "24px",
    color: "#333",
  },
};
