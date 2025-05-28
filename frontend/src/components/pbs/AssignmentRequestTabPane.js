import { Button } from "reactstrap";

export default function AssignmentRequestTabPane() {
  return (
    <div className="text-center py-5">
      <h4 className="mb-3">Tayin Talepleri</h4>
      <Button color="outline-primary" disabled>
        Yeni Tayin Talebi Oluştur
      </Button>
    </div>
  );
}
