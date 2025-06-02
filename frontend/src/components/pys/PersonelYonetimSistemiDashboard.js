import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import {
  FaUsers,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFileAlt,
  FaFilter,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import NavigationBar from "../navbar/Navbar";

const cookies = new Cookies();

export default function PersonelYonetimSistemiDashboard() {
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    court: "",
    requestedCourt: "",
    searchTerm: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [courthouses, setCourthouses] = useState([]);

  const [viewModal, setViewModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourthouses();
    if (activeTab === "1") {
      fetchAssignmentRequests();
    } else if (activeTab === "2") {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    // Filtreleri uygula
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, assignmentRequests]);

  const fetchCourthouses = async () => {
    try {
      const response = await axios.get("/api/courthouses/list");
      if (response.data && response.data.courthouses) {
        setCourthouses(response.data.courthouses);
      }
    } catch (error) {
      console.error("Adliye listesi alınırken hata:", error);
    }
  };

  const fetchAssignmentRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      const response = await axios({
        method: "GET",
        url: "/api/assignment-requests",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssignmentRequests(response.data.requests || []);
      setFilteredRequests(response.data.requests || []);
      calculatePagination(response.data.requests || []);
      setLoading(false);
    } catch (error) {
      console.error("Tayin talepleri alınırken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talepleri alınırken bir hata oluştu."
      );
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      const response = await axios({
        method: "GET",
        url: "/api/users/all",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsersList(response.data.users || []);
      setLoading(false);
    } catch (error) {
      console.error("Kullanıcılar alınırken hata:", error);
      setError(
        error.response?.data?.message ||
          "Kullanıcılar alınırken bir hata oluştu."
      );
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assignmentRequests];

    if (filters.status) {
      filtered = filtered.filter((req) => req.status === filters.status);
    }

    if (filters.court) {
      filtered = filtered.filter(
        (req) => req.currentCourthouse === parseInt(filters.court)
      );
    }

    if (filters.requestedCourt) {
      filtered = filtered.filter(
        (req) => req.requestedCourthouse === parseInt(filters.requestedCourt)
      );
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.userName?.toLowerCase().includes(searchLower) ||
          req.userSurname?.toLowerCase().includes(searchLower) ||
          req.userRegistrationNumber?.toString().includes(searchLower) ||
          req.applicationNumber?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
    calculatePagination(filtered);
    setCurrentPage(1); // Filtreleme sonrası ilk sayfaya dön
  };

  const calculatePagination = (items) => {
    setTotalPages(Math.ceil(items.length / itemsPerPage));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      court: "",
      requestedCourt: "",
      searchTerm: "",
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setViewModal(true);
  };

  const viewDocuments = (request) => {
    setSelectedRequest(request);
    setSelectedDocuments(request.documents || []);
    setDocumentModal(true);
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setApproveModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectModal(true);
    setRejectReason("");
  };

  const approveRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setSubmitting(false);
        return;
      }

      await axios({
        method: "PUT",
        url: `/api/assignment-requests/approve/${selectedRequest._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Talep listesini yenile
      fetchAssignmentRequests();

      // Modal kapat
      setApproveModal(false);

      // Başarı mesajı göster
      setSuccessMessage("Tayin talebi başarıyla onaylandı");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Tayin talebi onaylanırken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talebi onaylanırken bir hata oluştu."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Tayin talebini reddet
  const rejectRequest = async () => {
    if (!selectedRequest) return;

    if (!rejectReason || rejectReason.trim().length < 10) {
      setError("Lütfen en az 10 karakter içeren bir red sebebi girin.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setSubmitting(false);
        return;
      }

      await axios({
        method: "PUT",
        url: `/api/assignment-requests/reject/${selectedRequest._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          rejectionReason: rejectReason,
        },
      });

      // Talep listesini yenile
      fetchAssignmentRequests();

      // Modal kapat
      setRejectModal(false);

      // Başarı mesajı göster
      setSuccessMessage("Tayin talebi reddedildi");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Tayin talebi reddedilirken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talebi reddedilirken bir hata oluştu."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Durum badgeleri için stil ve metin
  const getStatusBadge = (status) => {
    switch (status) {
      case "preparing":
        return <Badge color="warning">Hazırlanıyor</Badge>;
      case "pending":
        return <Badge color="primary">İncelemede</Badge>;
      case "approved":
        return <Badge color="success">Onaylandı</Badge>;
      case "rejected":
        return <Badge color="danger">Reddedildi</Badge>;
      default:
        return <Badge color="secondary">Bilinmiyor</Badge>;
    }
  };

  // Mevcut sayfadaki talepleri al
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Talep türü etiketi
  const getTypeLabel = (type) => {
    switch (type) {
      case "optional":
        return "İsteğe Bağlı";
      case "mandatory":
        return "Zorunlu";
      case "martyrRelative":
        return "Şehit Yakını";
      case "spouseUnification":
        return "Eş Durumu";
      case "healthReason":
        return "Sağlık";
      default:
        return "Diğer";
    }
  };

  // Yükleme durumunda içerik
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">Veriler yükleniyor...</p>
      </Container>
    );
  }

  return (
    <div>
      <NavigationBar />

      <Container className="my-5">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold" style={{ color: "#1976d2" }}>
              Personel Yönetim Sistemi
            </h2>
            <p className="text-muted">
              Personel tayin taleplerini görüntüleyin, onaylayın veya reddedin.
            </p>
          </Col>
        </Row>

        {/* Başarı mesajı */}
        {successMessage && (
          <Alert color="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {/* Hata mesajı */}
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
            <Button
              color="link"
              className="p-0 ms-2"
              onClick={() =>
                activeTab === "1" ? fetchAssignmentRequests() : fetchUsers()
              }
            >
              Tekrar deneyin
            </Button>
          </Alert>
        )}

        <Card className="shadow-sm">
          <CardBody className="p-0">
            {/* Tablar */}
            <Nav tabs className="nav-tabs-custom p-2 bg-light">
              <NavItem>
                <NavLink
                  className={`${activeTab === "1" ? "active" : ""}`}
                  onClick={() => toggleTab("1")}
                  style={{ cursor: "pointer" }}
                >
                  <FaExchangeAlt className="me-2" />
                  Tayin Talepleri
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`${activeTab === "2" ? "active" : ""}`}
                  onClick={() => toggleTab("2")}
                  style={{ cursor: "pointer" }}
                >
                  <FaUsers className="me-2" />
                  Personel Listesi
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab} className="p-4">
              {/* Tayin Talepleri Tab İçeriği */}
              <TabPane tabId="1">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                  <h4 className="mb-3 mb-md-0">Tayin Talepleri</h4>

                  <div>
                    <Button
                      color="primary"
                      outline
                      className="me-2"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FaFilter className="me-1" />
                      {showFilters ? "Filtreleri Gizle" : "Filtrele"}
                    </Button>
                    <Button
                      color="primary"
                      outline
                      onClick={fetchAssignmentRequests}
                    >
                      <FaSearch className="me-1" /> Yenile
                    </Button>
                  </div>
                </div>

                {/* Filtreler */}
                {showFilters && (
                  <Card className="mb-4 border">
                    <CardBody>
                      <Row>
                        <Col md={3} className="mb-3 mb-md-0">
                          <FormGroup>
                            <Label for="statusFilter">Durum</Label>
                            <Input
                              type="select"
                              id="statusFilter"
                              name="status"
                              value={filters.status}
                              onChange={handleFilterChange}
                            >
                              <option value="">Tümü</option>
                              <option value="pending">İncelemede</option>
                              <option value="approved">Onaylandı</option>
                              <option value="rejected">Reddedildi</option>
                              <option value="preparing">Hazırlanıyor</option>
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col md={3} className="mb-3 mb-md-0">
                          <FormGroup>
                            <Label for="courtFilter">Mevcut Adliye</Label>
                            <Input
                              type="select"
                              id="courtFilter"
                              name="court"
                              value={filters.court}
                              onChange={handleFilterChange}
                            >
                              <option value="">Tümü</option>
                              {courthouses.map((court) => (
                                <option
                                  key={court.plateCode}
                                  value={court.plateCode}
                                >
                                  {court.name}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col md={3} className="mb-3 mb-md-0">
                          <FormGroup>
                            <Label for="requestedCourtFilter">
                              Talep Edilen Adliye
                            </Label>
                            <Input
                              type="select"
                              id="requestedCourtFilter"
                              name="requestedCourt"
                              value={filters.requestedCourt}
                              onChange={handleFilterChange}
                            >
                              <option value="">Tümü</option>
                              {courthouses.map((court) => (
                                <option
                                  key={court.plateCode}
                                  value={court.plateCode}
                                >
                                  {court.name}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col md={3}>
                          <FormGroup>
                            <Label for="searchFilter">Arama</Label>
                            <Input
                              type="text"
                              id="searchFilter"
                              name="searchTerm"
                              placeholder="Ad, soyad, sicil no..."
                              value={filters.searchTerm}
                              onChange={handleFilterChange}
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      <div className="text-end mt-3">
                        <Button
                          color="secondary"
                          outline
                          onClick={resetFilters}
                          className="me-2"
                        >
                          Filtreleri Sıfırla
                        </Button>
                        <Button color="primary" onClick={applyFilters}>
                          Uygula
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Tayin Talepleri Tablosu */}
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Başvuru No</th>
                        <th>Personel</th>
                        <th>Mevcut Adliye</th>
                        <th>Talep Edilen</th>
                        <th>Talep Tarihi</th>
                        <th>Tür</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageItems().length > 0 ? (
                        getCurrentPageItems().map((request) => (
                          <tr key={request._id}>
                            <td>{request.applicationNumber}</td>
                            <td>
                              {request.user.name} {request.user.surname} {"("}
                              <small className="text-muted">
                                {request.user.registrationNumber}
                              </small>
                              {")"}
                            </td>
                            <td>{request.currentCourthouseName}</td>
                            <td>{request.requestedCourthouseName}</td>
                            <td>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td>{getTypeLabel(request.type)}</td>
                            <td>{getStatusBadge(request.status)}</td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  color="primary"
                                  size="sm"
                                  className="me-1"
                                  title="Görüntüle"
                                  onClick={() => viewRequest(request)}
                                >
                                  <FaEye />
                                </Button>

                                {request.documents &&
                                  request.documents.length > 0 && (
                                    <Button
                                      color="secondary"
                                      size="sm"
                                      className="me-1"
                                      title="Belgeleri Görüntüle"
                                      onClick={() => viewDocuments(request)}
                                    >
                                      <FaFileAlt />
                                    </Button>
                                  )}

                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      color="success"
                                      size="sm"
                                      className="me-1"
                                      title="Onayla"
                                      onClick={() => openApproveModal(request)}
                                    >
                                      <FaCheck />
                                    </Button>
                                    <Button
                                      color="danger"
                                      size="sm"
                                      title="Reddet"
                                      onClick={() => openRejectModal(request)}
                                    >
                                      <FaTimes />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            {filteredRequests.length === 0
                              ? "Herhangi bir tayin talebi bulunamadı"
                              : "Filtrelere uygun tayin talebi bulunamadı"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <Button
                            className="page-link"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Önceki
                          </Button>
                        </li>

                        {[...Array(totalPages)].map((_, index) => (
                          <li
                            key={index}
                            className={`page-item ${
                              currentPage === index + 1 ? "active" : ""
                            }`}
                          >
                            <Button
                              className="page-link"
                              onClick={() => changePage(index + 1)}
                            >
                              {index + 1}
                            </Button>
                          </li>
                        ))}

                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <Button
                            className="page-link"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Sonraki
                          </Button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </TabPane>

              {/* Personel Listesi Tab İçeriği */}
              <TabPane tabId="2">
                <h4 className="mb-4">Personel Listesi</h4>

                {/* Personel Listesi (Bu kısmı ihtiyaca göre geliştirebilirsiniz) */}
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Sicil No</th>
                        <th>Ad Soyad</th>
                        <th>Adliye</th>
                        <th>Birim</th>
                        <th>Roller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length > 0 ? (
                        usersList.map((user) => (
                          <tr key={user._id}>
                            <td>{user.registrationNumber}</td>
                            <td>
                              {user.name} {user.surname}
                            </td>
                            <td>{user.court?.name || "Belirtilmemiş"}</td>
                            <td>{user.unitName || "Belirtilmemiş"}</td>
                            <td>
                              {user.rolesVisible?.map((role, index) => (
                                <Badge
                                  key={index}
                                  color="info"
                                  className="me-1"
                                >
                                  {role.label}
                                </Badge>
                              ))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            Henüz kayıtlı personel bulunmamaktadır
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </Container>

      {/* Talep Görüntüleme Modalı */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="lg">
        <ModalHeader toggle={() => setViewModal(false)}>
          Tayin Talebi Detayları
        </ModalHeader>
        <ModalBody>
          {selectedRequest && (
            <div>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Başvuru No</Label>
                    <div>{selectedRequest.applicationNumber}</div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Talep Tarihi</Label>
                    <div>
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Personel</Label>
                    <div>
                      {selectedRequest.userName} {selectedRequest.userSurname}
                    </div>
                    <small className="text-muted">
                      Sicil No: {selectedRequest.userRegistrationNumber}
                    </small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Durum</Label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Mevcut Adliye</Label>
                    <div>{selectedRequest.currentCourthouseName}</div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Talep Edilen Adliye</Label>
                    <div>{selectedRequest.requestedCourthouseName}</div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Talep Tipi</Label>
                    <div>{getTypeLabel(selectedRequest.type)}</div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Ekli Belge Sayısı</Label>
                    <div>
                      {selectedRequest.documents?.length || 0} adet belge
                    </div>
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <FormGroup>
                    <Label className="fw-bold">Talep Sebebi</Label>
                    <div className="p-3 bg-light rounded">
                      {selectedRequest.reason}
                    </div>
                  </FormGroup>
                </Col>

                {selectedRequest.status === "rejected" && (
                  <Col xs={12}>
                    <FormGroup>
                      <Label className="fw-bold">Red Sebebi</Label>
                      <div className="p-3 bg-light rounded">
                        {selectedRequest.rejectionReason}
                      </div>
                      <small className="text-muted">
                        Red Tarihi:{" "}
                        {new Date(selectedRequest.rejectedAt).toLocaleString()}
                      </small>
                    </FormGroup>
                  </Col>
                )}

                {selectedRequest.status === "approved" && (
                  <Col xs={12}>
                    <FormGroup>
                      <Label className="fw-bold">Onay Tarihi</Label>
                      <div>
                        {new Date(selectedRequest.approvedAt).toLocaleString()}
                      </div>
                    </FormGroup>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewModal(false)}>
            Kapat
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={documentModal}
        toggle={() => setDocumentModal(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setDocumentModal(false)}>
          Talep Belgeleri
        </ModalHeader>
        <ModalBody>
          {selectedDocuments.length > 0 ? (
            <div>
              <p>Toplam {selectedDocuments.length} adet belge bulunuyor:</p>
              <ul className="list-group">
                {selectedDocuments.map((doc, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      <FaFileAlt className="me-2" />
                      {doc.originalName || `Belge ${index + 1}`}
                    </span>
                    <div>
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary me-2"
                      >
                        <FaEye className="me-1" /> Görüntüle
                      </a>
                      <a href={doc} download className="btn btn-sm btn-success">
                        <FaDownload className="me-1" /> İndir
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center">Bu talebe ait belge bulunmamaktadır.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDocumentModal(false)}>
            Kapat
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={approveModal} toggle={() => setApproveModal(false)}>
        <ModalHeader toggle={() => setApproveModal(false)}>
          Tayin Talebini Onayla
        </ModalHeader>
        <ModalBody>
          <p>
            <strong>
              {selectedRequest?.userName} {selectedRequest?.userSurname}
            </strong>{" "}
            Personelin <strong>{selectedRequest?.currentCourthouseName}</strong>
            'den <strong>{selectedRequest?.requestedCourthouseName}</strong>'e
            tayin talebini onaylamak istediğinize emin misiniz?
          </p>
          <Alert color="warning">
            <strong>Dikkat:</strong> Onay işlemi geri alınamaz.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setApproveModal(false)}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button
            color="success"
            onClick={approveRequest}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Onaylanıyor...
              </>
            ) : (
              <>
                <FaCheck className="me-2" />
                Tayin Talebini Onayla
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={rejectModal} toggle={() => setRejectModal(false)}>
        <ModalHeader toggle={() => setRejectModal(false)}>
          Tayin Talebini Reddet
        </ModalHeader>
        <ModalBody>
          <p>
            <strong>
              {selectedRequest?.userName} {selectedRequest?.userSurname}
            </strong>{" "}
            adlı personelin{" "}
            <strong>{selectedRequest?.currentCourthouseName}</strong>'den{" "}
            <strong>{selectedRequest?.requestedCourthouseName}</strong>'e tayin
            talebini reddetmek üzeresiniz.
          </p>

          <FormGroup>
            <Label for="rejectReason">Red Sebebi*</Label>
            <Input
              type="textarea"
              id="rejectReason"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tayin talebinin reddedilme sebebini açıklayınız..."
              invalid={rejectReason.trim().length < 10}
            />
            {rejectReason.trim().length < 10 && (
              <div className="text-danger small mt-1">
                Red sebebi en az 10 karakter olmalıdır.
              </div>
            )}
          </FormGroup>

          <Alert color="warning">
            <strong>Dikkat:</strong> Red işlemi geri alınamaz.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setRejectModal(false)}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button
            color="danger"
            onClick={rejectRequest}
            disabled={submitting || rejectReason.trim().length < 10}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Reddediliyor...
              </>
            ) : (
              <>
                <FaTimes className="me-2" />
                Tayin Talebini Reddet
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
