import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, BookOpen, Award, TrendingUp, Eye } from "lucide-react";
import { useState } from "react";
import PaperModal from "./PaperModal";

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

const Research = () => {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const publications: Paper[] = [
    {
      title: "Zeta-Prime Sparse Networks: Infusing Number-Theoretic Priors for Structured Sparsity",
      authors: "Dalton Omondi, Grok 42",
      year: "2025",
      abstract: "The overparameterization of deep neural networks often leads to inefficiency and poor generalization. While traditional regularizers like L1 and L2 promote sparsity or weight shrinkage, they lack a principled, domain-inspired structure. We introduce Zeta-Prime Sparse Networks (ZPSN), a novel regularization framework grounded in analytic number theory. ZPSN uses the Riemann zeta function, ζ(s), to impose a sparsity pattern inspired by the distribution of prime numbers. The regularizer encourages a weight distribution where most parameters are near zero, with sparse, significant outliers—mimicking the primality property. Experiments on CIFAR-10 show that ZPSN achieves comparable sparsity to baseline models (20.7% vs. 22.8%) while slightly improving test accuracy (70.7% vs. 69.7%) and demonstrating superior robustness to post-training pruning.",
      tags: ["Number Theory", "Neural Networks", "Sparsity", "Regularization", "CIFAR-10"],
      pdfPath: "/papers/zpsn_vs_tradcnn.pdf",
      status: "draft"
    },
    {
      title: "From Software Models to Optical Circuits: Operator-Level Translation of Convolutional Neural Networks for Photonic Neural Processors",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "Photonic neural networks (PNNs) provide a promising approach to alleviate the energy and latency limitations of electronic deep learning accelerators. A key challenge, however, lies in systematically embedding trained models into silicon photonic (SiP) hardware. This work introduces an operator-based framework that maps neural network primitives—including convolutions, activations, pooling, and residual connections—onto SiP building blocks such as Mach–Zehnder interferometer meshes, microring resonators, and multimode interference couplers. As a case study, MNIST inference is demonstrated using spectrum-slicing convolutions with photodetection pooling, achieving approximately 98% accuracy at 0.1 fJ/MAC and 7.6×10⁶ inferences/s.",
      tags: ["Photonic Computing", "Silicon Photonics", "CNN", "Optical Accelerators", "EfficientNet", "Neuromorphic"],
      pdfPath: "/papers/Photonic_chips_for_machine_learning.pdf",
      status: "submitted"
    },
    {
      title: "Light Based Applications in Medicine: Integrated Pulse Oximetry-Glucose Monitoring",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "The convergence of pulse oximetry and glucose monitoring technologies represents a paradigm shift in non-invasive biosensing. This review examines the technical requirements, current research progress and implementation challenges of integrated optical systems capable of simultaneous oxygen saturation (SpO₂) and blood glucose level (BGL) measurements. We analyze recent advances in photoplethysmography (PPG) signal processing, multiwavelength optical configurations and machine learning algorithms applied to glucose estimation. While technical and regulatory hurdles remain, integrated pulse oximetry-glucose monitors show incredible potential for diabetes monitoring and management.",
      tags: ["Biomedical Engineering", "Photoplethysmography", "Glucose Monitoring", "Pulse Oximetry", "Medical Devices"],
      pdfPath: "/papers/Light_Based_Applications_in_Medicine__Integrated_Pulse_Oximetry_Glucose_Monitoring.pdf",
      status: "draft"
    },
    {
      title: "Metasurfaces: High Impedance Surfaces",
      authors: "Dalton Omondi",
      year: "2023",
      abstract: "In this paper, we introduce the high impedance surfaces (HIS), which are metasurfaces that have been found to have abnormal electromagnetic (EM) properties, and thus are of interest in EMC (Electromagnetic Compatibility) applications. We look into the design of a one-patch, one-cell HIS, after which we design a mushroom-type HIS and cavity-type HIS. Finally, we highlight two applications of HIS in shielding box design and antenna design. Through these examples, we demonstrate how HIS can be engineered to reflect EM waves without phase reversal, suppress surface wave propagation, and contribute to optimized EM environments for modern electronic systems.",
      tags: ["Metasurfaces", "Electromagnetic Compatibility", "Antenna Design", "High Impedance Surfaces", "EMC"],
      pdfPath: "/papers/High_Impedance_Surfaces (2).pdf",
      status: "submitted"
    },
    {
      title: "Stochastic Processes and Machine Learning in Commodity Price Forecasting: Insights from the Mitsui & Co. Commodity Prediction Challenge",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "Commodity markets exhibit profound volatility, shaped by stochastic dynamics and multifaceted global influences. This paper advances the modeling of commodity returns through a dual lens: theoretical stochastic processes and practical machine learning pipelines. Inspired by the 2025 Mitsui & Co. Commodity Prediction Challenge on Kaggle, we formalize processes like Geometric Brownian Motion (GBM), Ornstein-Uhlenbeck (OU), and jump-diffusion models via stochastic differential equations (SDEs). We then integrate empirical insights from a comprehensive ML baseline—employing ensemble tree boosters (LightGBM, XGBoost, CatBoost) with cross-validation and feature engineering—trained on the competition's multi-asset dataset. The ML pipeline achieves RMSE 0.029-0.030 across 424 targets, emphasizing stability via the challenge's Sharpe-variant metric.",
      tags: ["Stochastic Processes", "Machine Learning", "Commodity Forecasting", "Kaggle Competition", "Financial Modeling", "Ensemble Methods"],
      pdfPath: "/papers/Stoch_market_pred.pdf",
      status: "draft"
    },
    {
      title: "Feasibility Study: EEG-Based Epilepsy Detection System",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "This feasibility study explores the development of a portable EEG-based epilepsy detection system using machine learning algorithms for real-time seizure prediction. We analyze signal processing techniques, feature extraction methods, and classification algorithms suitable for wearable implementation. The study evaluates hardware requirements, power consumption constraints, and regulatory considerations for a low-cost, accessible epilepsy monitoring device that can provide early warnings to patients and caregivers.",
      tags: ["Epilepsy Detection", "EEG", "Biomedical Devices", "Machine Learning", "Healthcare", "Wearables"],
      pdfPath: "/papers/epilepsy_detection.pdf",
      status: "draft"
    },
    {
      title: "Feasibility Study: Continuous Glucose Monitoring Using Test Strip Technology",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "This study investigates the technical and commercial feasibility of developing a semi-continuous glucose monitoring system that leverages existing test strip technology with automated sampling mechanisms. We examine miniaturization challenges, biosensor chemistry, microfluidics integration, and user experience design. The analysis includes market assessment, regulatory pathways, manufacturing considerations, and cost projections for a device that bridges the gap between traditional finger-prick testing and continuous glucose monitors.",
      tags: ["Glucose Monitoring", "Diabetes Management", "Biosensors", "Medical Devices", "Point-of-Care", "Microfluidics"],
      pdfPath: "/papers/med_inv__continuous_glucose_monitoring_using_test_strips.pdf",
      status: "draft"
    },
    {
      title: "Feasibility Study: Smartphone Camera-Based Diabetic Retinopathy Screening",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "This feasibility analysis explores the development of an AI-powered smartphone application for diabetic retinopathy screening using standard phone cameras. We evaluate image acquisition challenges, deep learning model requirements, clinical validation needs, and deployment strategies. The study assesses the technical viability of creating an accessible, low-cost screening tool that can be used in primary care settings and remote locations where ophthalmological services are limited.",
      tags: ["Diabetic Retinopathy", "Mobile Health", "Computer Vision", "Deep Learning", "Ophthalmology", "AI Diagnostics"],
      pdfPath: "/papers/phone_camera_for_screening_diabetic_retinopathy.pdf",
      status: "draft"
    },
    {
      title: "Feasibility Study: Lens-Integrated Imagers for Sepsis and UTI Detection",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "This study examines the feasibility of developing compact lens-integrated imaging systems for rapid detection of sepsis biomarkers and urinary tract infections. We analyze optical design considerations, microfluidic sample handling, detection algorithms, and point-of-care integration. The technical assessment covers miniaturization challenges, sensitivity requirements, multiplexing capabilities, and regulatory pathways for a device enabling early infection detection in emergency and ambulatory settings.",
      tags: ["Sepsis Detection", "UTI Diagnostics", "Lens Imagers", "Microfluidics", "Point-of-Care", "Biomarker Detection"],
      pdfPath: "/papers/sepsis_UTI_lens_imagers.pdf",
      status: "draft"
    },
    {
      title: "Feasibility Study: Multi-Parameter Vital Signs Tricorder Device",
      authors: "Dalton Omondi",
      year: "2025",
      abstract: "This comprehensive feasibility study explores the development of a handheld tricorder-style device capable of measuring multiple vital signs including heart rate, blood pressure, temperature, blood oxygen, and respiratory rate. We evaluate sensor integration challenges, signal processing requirements, power management, and user interface design. The analysis includes market positioning, competitive landscape, regulatory considerations, and technical roadmap for creating a consumer-friendly, medical-grade vital signs monitoring device.",
      tags: ["Vital Signs Monitoring", "Tricorder", "Multi-Parameter Sensing", "Wearable Tech", "Healthcare IoT", "Biosensors"],
      pdfPath: "/papers/vital_signs_tricorder.pdf",
      status: "draft"
    }
  ];

  const interests = [
    "Hardware-Software Co-Design for AI",
    "Neuromorphic Computing",
    "Efficient Neural Network Architectures",
    "Low-Power Embedded Systems",
    "Photonic Chip Design",
    "Autonomous Systems",
  ];

  const handlePaperClick = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
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

  // Calculate dynamic stats
  const totalPapers = publications.length;
  const publishedCount = publications.filter(p => p.status === 'published').length;
  const draftCount = publications.filter(p => p.status === 'draft').length;
  const submittedCount = publications.filter(p => p.status === 'submitted').length;
  const preprintCount = publications.filter(p => p.status === 'preprint').length;

  return (
    <section id="research" className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden bg-background z-10">
      {/* Background elements */}
      <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent hidden md:block" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 lg:space-y-20">
          {/* Section Header */}
          <div className="text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent/10 border border-accent/20 rounded-full backdrop-blur-sm mb-2 md:mb-4">
              <BookOpen className="w-3 md:w-4 h-3 md:h-4 text-accent" />
              <span className="text-xs md:text-sm font-medium text-foreground">Academic Contributions</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              Research & <span className="bg-gradient-to-r from-[hsl(30,90%,58%)] to-[hsl(20,85%,55%)] bg-clip-text text-transparent">Papers</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Exploring the intersection of machine learning and hardware design through
              ongoing research projects and academic papers.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4 md:pt-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground text-lg">{totalPapers}</span> Research Papers
                </span>
              </div>
              {publishedCount > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground text-lg">{publishedCount}</span> Published
                  </span>
                </div>
              )}
              {draftCount > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground text-lg">{draftCount}</span> Drafts
                  </span>
                </div>
              )}
              {submittedCount > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground text-lg">{submittedCount}</span> Under Review
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground text-lg">{interests.length}</span> Research Interests
                </span>
              </div>
            </div>
          </div>

          {/* Publications List */}
          <div className="space-y-5 md:space-y-6 lg:space-y-8">
            {publications.length > 0 ? (
              publications.map((pub, index) => (
                <Card
                  key={pub.title}
                  className="group relative p-4 md:p-6 lg:p-8 bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 overflow-hidden"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="p-3 md:p-4 rounded-xl bg-accent/10 group-hover:bg-accent/20 border border-accent/20 group-hover:border-accent/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 inline-block md:block">
                        <FileText className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3 md:space-y-4">
                      <div>
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 group-hover:text-accent transition-colors">
                          {pub.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm mb-2 md:mb-3">
                          <span className="text-muted-foreground font-medium">{pub.authors}</span>
                          <span className="text-muted-foreground hidden sm:inline">•</span>
                          <span className="text-muted-foreground font-medium">{pub.year}</span>
                          {pub.venue && (
                            <>
                              <span className="text-muted-foreground hidden sm:inline">•</span>
                              <span className="font-semibold text-foreground/90 px-2 md:px-3 py-0.5 md:py-1 bg-accent/10 rounded-full text-xs">{pub.venue}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm lg:text-base text-foreground/80 leading-relaxed">
                        {pub.abstract.length > 200 ? `${pub.abstract.substring(0, 200)}...` : pub.abstract}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
                        <Badge className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 ${getStatusColor(pub.status)}`}>
                          {getStatusText(pub.status)}
                        </Badge>
                        {pub.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1.5 bg-secondary/50 hover:bg-accent/20 hover:text-accent transition-colors">
                            {tag}
                          </Badge>
                        ))}
                        {pub.tags.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1.5 bg-secondary/50">
                            +{pub.tags.length - 3}
                          </Badge>
                        )}
                        <button
                          onClick={() => handlePaperClick(pub)}
                          className="ml-auto flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-accent hover:text-accent/80 transition-all group/link px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-accent/10"
                        >
                          <span className="hidden sm:inline">View Paper</span>
                          <span className="sm:hidden">View</span>
                          <Eye className="h-3 w-3 md:h-4 md:w-4 group-hover/link:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="relative p-8 md:p-12 bg-card/30 backdrop-blur-sm border-dashed border-2 border-accent/30 text-center">
                <div className="space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-accent/60" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground/80">Publications Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Currently working on research projects that will be submitted for peer review. 
                      This section will be updated as papers are published.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <Badge variant="outline" className="text-xs px-3 py-1.5">Work in Progress</Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1.5">Research Active</Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1.5">Submissions Planned</Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Research Interests */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-2xl md:rounded-3xl blur-3xl" />
            <div className="relative bg-card/30 backdrop-blur-sm border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-12 space-y-6 md:space-y-8">
              <div className="text-center space-y-2 md:space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Research <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Interests</span>
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  Exploring cutting-edge topics at the frontier of AI and hardware innovation
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
                {interests.map((interest, idx) => (
                  <div
                    key={interest}
                    className="group relative flex items-center gap-2 md:gap-3 p-3 md:p-4 lg:p-5 rounded-lg md:rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-lg md:rounded-xl transition-opacity" />
                    <div className="relative flex items-center gap-2 md:gap-3 w-full">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-primary animate-pulse flex-shrink-0" />
                      <span className="text-xs md:text-sm lg:text-base text-foreground/90 font-medium group-hover:text-primary transition-colors">{interest}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-4 md:pt-6">
                <p className="text-sm md:text-base text-muted-foreground font-medium mb-3 md:mb-4">
                  💡 Open to collaborations and research opportunities
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <span className="px-2 md:px-3 py-1 bg-primary/10 rounded-full">Co-authorship</span>
                  <span className="px-2 md:px-3 py-1 bg-accent/10 rounded-full">Joint Projects</span>
                  <span className="px-2 md:px-3 py-1 bg-primary/10 rounded-full">Conference Presentations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Paper Modal */}
      <PaperModal
        paper={selectedPaper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default Research;
