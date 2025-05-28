import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardImg,
  CardBody,
  CardText,
  Row,
  Col,
  Badge,
  Button,
} from "reactstrap";

import Cookies from "universal-cookie";
import axios from "axios";
import email_red from "../../assets/email-red.svg";
import admin_user from "../../assets/admin-user.svg";

import { PBS_VISIBLE_ROLES, PYS_VISIBLE_ROLES} from "../constant/Perm";

import Navbar from "../navbar/Navbar";
import "../../styles/Home.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  useEffect(() => {
    if (user === null && token) {
      getUser();
    }
    // eslint-disable-next-line
  }, []);

  function getUser() {
    console.log(token);
    axios({
      method: "GET",
      url: "/api/users/me",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setUser(result.data.user);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  // UYAP Mail yönlendirme
  function handleUyapMail() {
    window.open("https://eposta.uyap.gov.tr/", "_blank");
  }

  // Personel Yönetim Sistemi
  function handlePYS() {
    window.location.href = "/pys";
  }

  // Personel Bilgi Sistemi
  function handlePBS() {
    window.location.href = "/pbs";
  }

  // Giriş yapma yönlendirme
  function handleLogin() {
    window.location.href = "/login";
  }

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const listGroupItems = [
    {
      id: 1,
      label: "Personel Bilgi Sistemi",
      detail:
        "Adliye personel bilgilerinizi görüntülemek ve güncellemek için tıklayınız.",
      type: "item",
      visibleRoles: PBS_VISIBLE_ROLES,
      image: admin_user,
      onClick: handlePBS,
      visible: true,
      color: "danger",
    },
    {
      id: 2,
      label: "Personel Yönetim Sistemi",
      detail: "Adliye personellerine ait işlemleri yönetmek için tıklayınız.",
      type: "item",
      visibleRoles: PYS_VISIBLE_ROLES,
      image: admin_user,
      onClick: handlePYS,
      visible: true,
      color: "dark",
    },

    {
      id: 4,
      label: "UYAP Mail",
      detail:
        "UYAP Mail hizmeti ile adliye personelleri arasında güvenli bir şekilde mail gönderip alabilirsiniz.",
      type: "item",
      image: email_red,
      onClick: handleUyapMail,
      visible: true,
      color: "warning",
    },
  ];

  return (
    <div className="home-page">
      <Navbar />

      <div className="hero-section">
        <Container>
          <div className="text-center py-5">
            <h1 className="display-4 hero-title">Adliye Yönetim Sistemi</h1>
            {!user && (
              <div>
                <Button
                  color="danger"
                  size="lg"
                  className="mt-3 hero-button"
                  onClick={handleLogin}
                >
                  <i className="fas fa-sign-in-alt mr-2"></i> Giriş Yapın
                </Button>
              </div>
            )}
            {user && (
              <p className="mt-3">
                Hoş geldiniz,{" "}
                <strong>
                  {user.name} {user.surname}
                </strong>
              </p>
            )}
          </div>
        </Container>
      </div>

      <Container className="main-content py-5">
        <Row className="mb-4">
          <Col>
            <div className="section-header">
              <h3 className="section-title">
                <i className="fas fa-th-large me-2"></i>
                Uygulamalar
              </h3>
              <p className="section-description">
                Adliye personeli olarak erişebileceğiniz uygulamalar aşağıda
                listelenmiştir
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="app-cards">
              <Row>
                {listGroupItems.map((item, index) => {
                  const isVisibleForRole =
                    (!item.visibleRoles ||
                      item.visibleRoles.length === 0 ||
                      (user &&
                        user.roles.some((role) =>
                          item.visibleRoles.includes(role)
                        ))) &&
                    (!item.hiddenRoles ||
                      item.hiddenRoles.length === 0 ||
                      (user &&
                        !user.roles.some((role) =>
                          item.hiddenRoles.includes(role)
                        ))) &&
                    item.visible;

                  const isHovered = hoveredIndex === index;

                  if (!isVisibleForRole) return null;

                  return (
                    <Col key={index} md="6" lg="4" className="mb-4">
                      <Card
                        className={`app-card ${isHovered ? "hover" : ""}`}
                        onClick={() => item.onClick()}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className={`app-card-header bg-${item.color}`}>
                          <CardImg
                            alt={`${item.label} Logo`}
                            src={item.image}
                            className="app-card-image"
                          />
                        </div>
                        <CardBody>
                          <Badge color={item.color} pill className="mb-2">
                            {item.label}
                          </Badge>
                          <CardText>{item.detail}</CardText>
                          <div className="app-card-action">
                            <i className="fas fa-arrow-right"></i>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="footer">
        <Container>
          <div className="text-center py-4">
            <p className="developer-info mb-0">Developed by Bilgehan Kalay</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
