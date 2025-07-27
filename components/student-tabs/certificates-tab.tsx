import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, Calendar } from "lucide-react";

const certificates = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    course: "Web Development Basics",
    issuedDate: "2024-01-15",
    certificateId: "WDF-2024-001",
    status: "issued",
    grade: "A",
    credentialUrl: "#",
  },
  {
    id: 2,
    title: "Database Management Certification",
    course: "Database Management Systems",
    issuedDate: "2024-01-20",
    certificateId: "DMS-2024-002",
    status: "issued",
    grade: "A+",
    credentialUrl: "#",
  },
  {
    id: 3,
    title: "React Development Certificate",
    course: "Advanced React Development",
    status: "pending",
    expectedDate: "2024-02-15",
    progress: 60,
  },
];

export function CertificatesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
        <p className="text-gray-600">
          Download and manage your earned certificates
        </p>
      </div>

      <div className="grid gap-4">
        {certificates.map((certificate) => (
          <Card key={certificate.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {certificate.title}
                    </CardTitle>
                    <CardDescription>{certificate.course}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    certificate.status === "issued" ? "default" : "secondary"
                  }
                  className={
                    certificate.status === "issued"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {certificate.status.charAt(0).toUpperCase() +
                    certificate.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificate.status === "issued" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Issue Date:
                      </span>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {certificate.issuedDate}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Certificate ID:
                      </span>
                      <p className="text-gray-600 mt-1 font-mono text-xs">
                        {certificate.certificateId}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Grade:</span>
                      <Badge
                        variant="outline"
                        className="mt-1 bg-green-50 text-green-700 border-green-200"
                      >
                        {certificate.grade}
                      </Badge>
                    </div>
                  </div>
                )}

                {certificate.status === "pending" && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-800">
                        Certificate in Progress
                      </span>
                      <span className="text-sm text-yellow-700">
                        {certificate.progress}% complete
                      </span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      Expected completion: {certificate.expectedDate}
                    </div>
                  </div>
                )}

                {certificate.status === "issued" && (
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      Verify Credential
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.filter((c) => c.status === "issued").length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete courses to earn your first certificate
            </p>
            <Button>Browse Courses</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
