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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3 md:space-y-4">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold leading-tight pr-2">
              {paper.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 md:space-y-3">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs sm:text-sm">
              <span className="font-semibold text-foreground">{paper.authors}</span>
              {paper.venue && (
                <>
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-muted-foreground">{paper.venue}</span>
                </>
              )}
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-muted-foreground">{paper.year}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <Badge className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 ${getStatusColor(paper.status)}`}>
                {getStatusText(paper.status)}
              </Badge>
              {paper.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                  {tag}
                </Badge>
              ))}
              {paper.tags.length > 5 && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                  +{paper.tags.length - 5}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 md:space-y-6 pt-3 md:pt-4">
          {/* Abstract */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-base md:text-lg font-semibold">Abstract</h3>
            <p className="text-foreground/80 leading-relaxed text-xs sm:text-sm">
              {paper.abstract}
            </p>
          </div>

          {/* PDF Viewer */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base md:text-lg font-semibold">Paper Preview</h3>
              <Button onClick={handleDownload} size="sm" className="gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-9">
                <Download className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-muted/20">
              <iframe
                src={`${paper.pdfPath}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-[400px] sm:h-[500px] md:h-[600px]"
                title={`${paper.title} - PDF Preview`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t">
            <Button onClick={handleDownload} className="gap-1.5 md:gap-2 text-sm md:text-base h-9 md:h-10">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={onClose} className="text-sm md:text-base h-9 md:h-10">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaperModal;
