import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Alert,
  Spinner,
  Badge,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import {
  FaExchangeAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPaperPlane,
} from "react-icons/fa";

const cookies = new Cookies();

export default function AssignmentRequestTabPane({ userData }) {
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [modal, setModal] = useState(false);
  const [courthouses, setCourthouses] = useState([]);
  const [formData, setFormData] = useState({
    requestedCourthouse: "",
    reason: "",
    type: "optional",
    documents: [], // Belge URL'leri için boş bir dizi başlat
  });
  const [documents, setDocuments] = useState([]); // Belgeler için state

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState("create"); // create, edit
  const [currentRequest, setCurrentRequest] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const types = [
    { value: "optional", label: "İsteğe bağlı" },
    { value: "educational", label: "Eğitim" },
    { value: "health", label: "Sağlık" },
    { value: "family", label: "Aile" },
    { value: "life safety", label: "Hayati tehlike" },
    { value: "other", label: "Diğer" },
  ];
  useEffect(() => {
    fetchAssignmentRequests();
    fetchCourthouses();
  }, []);

  // Tayin taleplerini çek/güncelle
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
        url: "/api/assignment-requests/my-requests",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssignmentRequests(response.data.requests || []);
      setLoading(false);
    } catch (error) {
      console.error("Tayin talepleri alınırken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talepleri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setLoading(false);
    }
  };

  // Adliye listesini çek
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

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setFormData({
        requestedCourthouse: "",
        reason: "",
        type: "optional",
        documents: [],
      });
      setFormErrors({});
      setAction("create");
      setCurrentRequest(null);
    }
  };

  const toggleConfirmModal = () => {
    setConfirmModal(!confirmModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input değişti:", name, value);
    console.log("Form verisi öncesi:", formData);
    setFormData({
      ...formData,
      [name]: value,
    });

    console.log("Form verisi sonrası:", formData);
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.requestedCourthouse) {
      errors.requestedCourthouse = "Talep edilen adliye seçilmelidir";
      isValid = false;
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      errors.reason = "Talep sebebi en az 10 karakter olmalıdır";
      isValid = false;
    }

    // Mevcut adliye ile talep edilen adliye aynı olamaz
    if (
      formData.requestedCourthouse &&
      parseInt(formData.requestedCourthouse) === parseInt(userData?.courtId)
    ) {
      errors.requestedCourthouse =
        "Talep edilen adliye mevcut adliye ile aynı olamaz";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const createAssignmentRequest = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setSubmitting(false);
        return;
      }

      const response = await axios({
        method: "POST",
        url: "/api/assignment-requests/create",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          currentCourthouse: userData?.courtId,
          requestedCourthouse: formData.requestedCourthouse,
          reason: formData.reason,
          type: formData.type || "optional",
          documents: formData.documents || [], // Belgeler varsa ekle
        },
      });

      // Tayin talepleri listesini güncelle
      fetchAssignmentRequests();

      toggleModal();
    } catch (error) {
      console.error("Tayin talebi oluştururken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talebi oluştururken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateAssignmentRequest = async () => {
    if (!validateForm() || !currentRequest) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setSubmitting(false);
        return;
      }

      // Güncellenecek veriyi hazırla
      const updateData = {
        requestedCourthouse: formData.requestedCourthouse,
        reason: formData.reason,
        type: formData.type || "optional",
      };

      // Belgeler varsa ekle
      if (formData.documents && formData.documents.length > 0) {
        updateData.documents = formData.documents;

        // Hata ayıklama
        console.log("Gönderilecek belgeler:", updateData.documents);
      }

      // Güncelleme isteği gönder
      await axios({
        method: "PUT",
        url: `/api/assignment-requests/update/${currentRequest._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: updateData,
      });

      // Listeyi yenile
      fetchAssignmentRequests();

      // Modal'ı kapat
      toggleModal();
    } catch (error) {
      console.error("Tayin talebi güncellenirken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talebi güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const editRequest = (request) => {
    setCurrentRequest(request);

    // Belgeleri doğru formata dönüştür
    let documentsList = [];

    if (request.documents && Array.isArray(request.documents)) {
      // documents dizisindeki her belge için doğru formatı oluştur
      documentsList = request.documents
        .map((doc) => {
          // Eğer doc bir string ise (URL) onu objeye çevir
          if (typeof doc === "string") {
            return {
              url: doc,
              originalName: doc.split("/").pop(),
            };
          }
          // Eğer doc zaten bir obje ise, onu doğrudan kullan
          else if (typeof doc === "object") {
            return {
              url: doc.url || doc,
              originalName: doc.originalName || doc.url.split("/").pop(),
            };
          }
          return null;
        })
        .filter((doc) => doc !== null); // null değerleri filtrele
    }

    // formData'yı ayarla
    setFormData({
      requestedCourthouse: request.requestedCourthouse.toString(),
      reason: request.reason,
      type: request.type || "optional",
      documents: documentsList.map((doc) => doc.url), // Sadece URL'leri al
    });

    // Belgeler state'ini ayarla
    setDocuments(documentsList);

    // Modal'ı aç
    setAction("edit");
    setModal(true);
  };

  const cancelRequest = async (requestId) => {
    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      await axios({
        method: "DELETE",
        url: `/api/assignment-requests/cancel/${requestId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Tayin talepleri listesini güncelle
      fetchAssignmentRequests();

      // Onay modalını kapat
      setConfirmModal(false);
    } catch (error) {
      console.error("Tayin talebi iptal edilirken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talebi iptal edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    }
  };

  const submitRequest = async (requestId) => {
    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      await axios({
        method: "PUT",
        url: `/api/assignment-requests/submit/${requestId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Tayin talepleri listesini güncelle
      fetchAssignmentRequests();

      // Onay modalını kapat
      setConfirmModal(false);
    } catch (error) {
      console.error("Tayin talebi onaya sunulurken hata:", error);
      setError(
        error.response?.data?.message ||
          "Tayin talebi onaya sunulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    }
  };

  const confirmActionModal = (action, requestId) => {
    setConfirmAction({ type: action, id: requestId });
    toggleConfirmModal();
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "cancel":
        cancelRequest(confirmAction.id);
        break;
      case "submit":
        submitRequest(confirmAction.id);
        break;
      default:
        break;
    }
  };

  const getLabelForType = (type) => {
    const typeObj = types.find((t) => t.value === type);
    return typeObj ? typeObj.label : "Bilinmiyor";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action === "create") {
      createAssignmentRequest();
    } else {
      updateAssignmentRequest();
    }
  };

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

  const getStatusDescription = (request) => {
    switch (request.status) {
      case "preparing":
        return "Tayin talebiniz şu anda hazırlık aşamasındadır. Talebi düzenleyebilir veya onaya sunabilirsiniz.";
      case "pending":
        return "Tayin talebiniz şu anda incelenmektedir. Sonuç beklenmelidir.";
      case "approved":
        return `Tayin talebiniz ${new Date(
          request.approvedAt
        ).toLocaleDateString()} tarihinde onaylanmıştır.`;
      case "rejected":
        return `Tayin talebiniz ${new Date(
          request.rejectedAt
        ).toLocaleDateString()} tarihinde reddedilmiştir. Sebep: ${
          request.rejectionReason
        }`;
      default:
        return "";
    }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    setUploadError(null);

    const fileInput = document.getElementById("documents");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setUploadError("Lütfen en az bir dosya seçin.");
      return;
    }

    const files = fileInput.files;

    if (files.length > 5) {
      setUploadError("Maksimum 5 dosya yükleyebilirsiniz.");
      return;
    }

    const uploadFormData = new FormData();

    // Mevcut talep ID'si varsa ve düzenleme modundaysak
    if (currentRequest && currentRequest._id) {
      uploadFormData.append("requestId", currentRequest._id);
    }

    for (let i = 0; i < files.length; i++) {
      // boyut
      if (files[i].size > 5 * 1024 * 1024) {
        setUploadError("Her dosya maksimum 5MB boyutunda olmalıdır.");
        return;
      }
      const acceptedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!acceptedTypes.includes(files[i].type)) {
        setUploadError(
          "Sadece PDF, DOC, DOCX, XLS, XLSX, JPG ve PNG dosyaları yükleyebilirsiniz."
        );
        return;
      }

      uploadFormData.append("documents", files[i]);
    }

    setSubmitting(true);

    // console.log("Dosya yükleniyor...", {
    //   fileCount: files.length,
    //   token: cookies.get("TOKEN") ? "Token var" : "Token yok",
    // });

    axios({
      method: "POST",
      url: "/api/assignment-requests/upload",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${cookies.get("TOKEN")}`,
      },
      data: uploadFormData,
    })
      .then((response) => {
        // console.log("Yükleme cevabı:", response.data);

        setSubmitting(false);

        if (
          response.data &&
          response.data.documents &&
          Array.isArray(response.data.documents)
        ) {
          const responseDocuments = response.data.documents.map((file) => ({
            url: file.url,
            originalName: file.originalName || file.name || "Belge",
          }));

          const fileUrls = responseDocuments.map((doc) => doc.url);

          setDocuments((prevDocs) => [...prevDocs, ...responseDocuments]);

          setFormData((prevData) => ({
            ...prevData,
            documents: [...(prevData.documents || []), ...fileUrls],
          }));

          setUploadError(null);

          fileInput.value = "";
        } else {
          setUploadError(
            "Belgeler yüklenirken bir hata oluştu: Geçersiz sunucu yanıtı."
          );
          // console.error("Geçersiz sunucu yanıtı:", response.data);
        }
      })
      .catch((error) => {
        console.error("Dosya yükleme hatası:", error);
        setSubmitting(false);
        setUploadError(
          error.response?.data?.message ||
            "Belgeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-3">Tayin talepleri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          <FaExchangeAlt className="me-2" />
          Tayin Talepleri
        </h4>
        <Button
          color="primary"
          onClick={toggleModal}
          disabled={assignmentRequests.some(
            (req) => req.status === "preparing" || req.status === "pending"
          )}
        >
          <FaPlus className="me-1" />
          Yeni Tayin Talebi
        </Button>
      </div>

      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {assignmentRequests.length === 0 ? (
        <Card className="mb-4">
          <CardBody className="text-center py-5">
            <FaExchangeAlt size={48} className="text-muted mb-3" />
            <h5>Henüz tayin talebiniz bulunmamaktadır</h5>
            <p className="text-muted mb-4">
              Yeni bir tayin talebi oluşturmak için yukarıdaki butona
              tıklayabilirsiniz.
            </p>
            <Button color="primary" onClick={toggleModal}>
              <FaPlus className="me-1" />
              Yeni Tayin Talebi Oluştur
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover bordered className="mb-4">
            <thead>
              <tr>
                <th>Başvuru No</th>
                <th>Mevcut Adliye</th>
                <th>Talep Edilen Adliye</th>
                <th>Talep Tarihi</th>
                <th>Talep Tipi</th>
                <th>Durum</th>
                <th>Belge Sayısı</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {assignmentRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.applicationNumber}</td>
                  <td>{request.currentCourthouseName}</td>
                  <td>{request.requestedCourthouseName}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>{getLabelForType(request.type)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    {request.documents && request.documents.length > 0
                      ? request.documents.length
                      : 0}
                  </td>

                  <td>
                    {request.status === "preparing" && (
                      <>
                        <Button
                          color="secondary"
                          size="sm"
                          className="me-1"
                          onClick={() => editRequest(request)}
                          title="Düzenle"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          color="primary"
                          size="sm"
                          className="me-1"
                          onClick={() =>
                            confirmActionModal("submit", request._id)
                          }
                          title="Onaya Sun"
                        >
                          <FaPaperPlane />
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() =>
                            confirmActionModal("cancel", request._id)
                          }
                          title="İptal Et"
                        >
                          <FaTrash />
                        </Button>
                      </>
                    )}
                    {request.status === "pending" && (
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() =>
                          confirmActionModal("cancel", request._id)
                        }
                        title="İptal Et"
                      >
                        <FaTrash />
                      </Button>
                    )}
                    {(request.status === "approved" ||
                      request.status === "rejected") && (
                      <span className="text-muted">İşlem yapılamaz</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {assignmentRequests.length > 0 && (
        <div className="mt-3">
          <h5>Tayin Talebi Durumu</h5>
          <Card>
            <CardBody>
              {assignmentRequests.map((request) => (
                <div key={`status-${request._id}`} className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    {getStatusBadge(request.status)}
                    <span className="ms-2 fw-bold">
                      {request.currentCourthouseName} →{" "}
                      {request.requestedCourthouseName}
                    </span>
                  </div>
                  <p className="mb-1 text-muted small">
                    {getStatusDescription(request)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Yeni Tayin Talebi / Düzenleme */}
      <Modal isOpen={modal} toggle={toggleModal} backdrop="static">
        <ModalHeader toggle={toggleModal}>
          {action === "create"
            ? "Yeni Tayin Talebi Oluştur"
            : "Tayin Talebini Düzenle"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="currentCourthouse">Mevcut Adliye</Label>
              <Input
                type="text"
                id="currentCourthouse"
                value={
                  userData?.courtId
                    ? courthouses.find(
                        (c) => c.plateCode === parseInt(userData.courtId)
                      )?.name || "Bilinmiyor"
                    : "Bilinmiyor"
                }
                disabled
              />
              <small className="text-muted">
                Mevcut görev yaptığınız adliye
              </small>
            </FormGroup>

            <FormGroup>
              <Label for="requestedCourthouse">Talep Edilen Adliye*</Label>
              <Input
                type="select"
                name="requestedCourthouse"
                id="requestedCourthouse"
                value={formData.requestedCourthouse}
                onChange={handleInputChange}
                invalid={!!formErrors.requestedCourthouse}
              >
                <option value="">Seçiniz</option>
                {courthouses
                  .filter(
                    (court) => court.plateCode !== parseInt(userData?.courtId)
                  )
                  .map((court) => (
                    <option key={court.plateCode} value={court.plateCode}>
                      {court.name}
                    </option>
                  ))}
              </Input>
              {formErrors.requestedCourthouse && (
                <FormFeedback>{formErrors.requestedCourthouse}</FormFeedback>
              )}
              <small className="text-muted">
                Tayin olmak istediğiniz adliye
              </small>
            </FormGroup>

            <FormGroup>
              <Label for="type">Talep Tipi</Label>
              <Input
                type="select"
                name="type"
                id="type"
                value={formData.type || "optional"}
                onChange={handleInputChange}
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label for="reason">Talep Sebebi*</Label>
              <Input
                type="textarea"
                name="reason"
                id="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="4"
                invalid={!!formErrors.reason}
              />
              {formErrors.reason && (
                <FormFeedback>{formErrors.reason}</FormFeedback>
              )}
              <small className="text-muted">
                Tayin talebinizin sebebini detaylı olarak açıklayınız
              </small>
            </FormGroup>

            {/* Docs */}
            <FormGroup>
              <Label for="documents">Ek Belgeler (Opsiyonel)</Label>
              <Input
                type="file"
                name="documents"
                id="documents"
                accept=".pdf,.doc,.docx,.jpg,.png,.xlS,.xlsx"
                multiple
              />
              <small className="text-muted">
                İsteğe bağlı olarak tayin talebinizi destekleyen belgeler
                ekleyebilirsiniz. (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                formatları desteklenir) <br />
                Maksimum 5 dosya, her biri 5MB boyutunda olabilir.
              </small>

              <Button color="link" onClick={handleFileUpload}>
                <FaPaperPlane className="me-1" />
                Belgeleri Yükle
              </Button>
              {uploadError && (
                <Alert color="danger" className="mt-2">
                  {uploadError}
                </Alert>
              )}

              <div className="mt-2">
                {documents.length > 0 ? (
                  <>
                    <Label>Yüklenen Belgeler</Label>
                    <ul className="list-group">
                      {documents.map((doc, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            {doc.originalName || `Belge ${index + 1}`}
                          </a>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => {
                              // Önce belgenin URL'sini al
                              const docUrl = doc.url;

                              // Documents listesinden belgeyi kaldır
                              setDocuments((prevDocs) => {
                                const newDocs = prevDocs.filter(
                                  (d, i) => i !== index
                                );
                                console.log("Güncel belgeler:", newDocs);
                                return newDocs;
                              });

                              // formData'daki documents dizisinden belgeyi kaldır
                              setFormData((prevData) => {
                                const newDocsUrls = prevData.documents.filter(
                                  (url) => url !== docUrl
                                );
                                console.log(
                                  "Güncel formData belgeler:",
                                  newDocsUrls
                                );
                                return {
                                  ...prevData,
                                  documents: newDocsUrls,
                                };
                              });
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <small className="text-muted">Henüz belge yüklenmedi.</small>
                )}
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={toggleModal}
              disabled={submitting}
            >
              İptal
            </Button>
            <Button color="success" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Kaydediliyor...
                </>
              ) : action === "create" ? (
                "Oluştur"
              ) : (
                "Güncelle"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Onay */}
      <Modal isOpen={confirmModal} toggle={toggleConfirmModal} size="sm">
        <ModalHeader toggle={toggleConfirmModal}>
          {confirmAction?.type === "cancel"
            ? "Tayin Talebini İptal Et"
            : "Tayin Talebini Onaya Sun"}
        </ModalHeader>
        <ModalBody>
          {confirmAction?.type === "cancel" ? (
            <p>
              Bu tayin talebini iptal etmek istediğinize emin misiniz? Bu işlem
              geri alınamaz.
            </p>
          ) : (
            <p>
              Tayin talebinizi onaya sunmak istediğinize emin misiniz? Onaya
              sunduktan sonra düzenleyemezsiniz.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConfirmModal}>
            Vazgeç
          </Button>
          <Button
            color={confirmAction?.type === "cancel" ? "danger" : "success"}
            onClick={handleConfirmAction}
          >
            {confirmAction?.type === "cancel" ? "Talebi İptal Et" : "Onaya Sun"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
