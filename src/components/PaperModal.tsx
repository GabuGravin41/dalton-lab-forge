import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, X } from "lucide-react";

interface Paper {
  title: string;
  authors: string;
  venue?: string;
  year: string;
  abstract: string;
  tags: string[];
  pdfPath: string;
  status: 'published' | 'submitted' | 'draft' | 'preprint';
}

interface PaperModalProps {
  paper: Paper | null;
  isOpen: boolean;
  onClose: () => void;
}

const PaperModal = ({ paper, isOpen, onClose }: PaperModalProps) => {
  if (!paper) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = paper.pdfPath;
    link.download = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'submitted': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'preprint': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'draft': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'submitted': return 'Under Review';
      case 'preprint': return 'Preprint';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-bold leading-tight pr-8">
              {paper.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-foreground">{paper.authors}</span>
              {paper.venue && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{paper.venue}</span>
                </>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{paper.year}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`text-xs px-3 py-1 ${getStatusColor(paper.status)}`}>
                {getStatusText(paper.status)}
              </Badge>
              {paper.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Abstract */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Abstract</h3>
            <p className="text-foreground/80 leading-relaxed text-sm">
              {paper.abstract}
            </p>
          </div>

          {/* PDF Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Paper Preview</h3>
              <Button onClick={handleDownload} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-muted/20">
              <iframe
                src={`${paper.pdfPath}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-[600px]"
                title={`${paper.title} - PDF Preview`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaperModal;
