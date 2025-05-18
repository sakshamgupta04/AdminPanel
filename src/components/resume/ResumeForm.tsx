import { useState } from "react";
import { FileText, Trash, Plus, Save, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ResumeData, Education, Experience } from "@/types/resume";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
  parsedFile: File | null;
  jsonData: string;
  setJsonData: React.Dispatch<React.SetStateAction<string>>;
}

export default function ResumeForm({ resumeData, setResumeData, parsedFile, jsonData, setJsonData }: ResumeFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value
      }
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    
    const updatedData = {
      ...resumeData,
      education: updatedEducation
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    
    const updatedData = {
      ...resumeData,
      experience: updatedExperience
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };

  const handleStringArrayChange = (field: keyof ResumeData, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    
    const updatedData = {
      ...resumeData,
      [field]: array,
      [`${field}Count` as keyof ResumeData]: array.length
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const handleNumberChange = (field: keyof ResumeData, value: string) => {
    const numValue = Number(value);
    
    setResumeData({
      ...resumeData,
      [field]: numValue
    });
    
    // If we're changing numberOfJobs or longevityYears, update averageExperience
    if (field === 'numberOfJobs' || field === 'longevityYears') {
      const longevity = field === 'longevityYears' ? numValue : resumeData.longevityYears;
      const jobs = field === 'numberOfJobs' ? numValue : resumeData.numberOfJobs;
      
      const avgExp = jobs > 0 ? longevity / jobs : 0;
      
      setResumeData(prev => {
        const updated = {
          ...prev!,
          averageExperience: parseFloat(avgExp.toFixed(2))
        };
        
        // Update JSON data
        setJsonData(JSON.stringify(updated, null, 2));
        return updated;
      });
    } else {
      // Update JSON data for other fields
      const updatedData = {
        ...resumeData,
        [field]: numValue
      };
      setJsonData(JSON.stringify(updatedData, null, 2));
    }
  };
  
  const handleRadioChange = (field: keyof ResumeData, value: string) => {
    const updatedData = {
      ...resumeData,
      [field]: Number(value)
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const addEducation = () => {
    const updatedData = {
      ...resumeData,
      education: [
        ...resumeData.education,
        { institution: "", degree: "" }
      ]
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const removeEducation = (index: number) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation.splice(index, 1);
    
    const updatedData = {
      ...resumeData,
      education: updatedEducation
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const addExperience = () => {
    const updatedData = {
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: "", position: "" }
      ]
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const removeExperience = (index: number) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience.splice(index, 1);
    
    const updatedData = {
      ...resumeData,
      experience: updatedExperience
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsText = e.target.value;
    const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(Boolean);
    
    const updatedData = {
      ...resumeData,
      skills: skillsArray,
      skillsCount: skillsArray.length
    };
    
    setResumeData(updatedData);
    
    // Update JSON data
    setJsonData(JSON.stringify(updatedData, null, 2));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // In a real application, you would send the data to your backend here
      // Here we're just sending the JSON data
      console.log("Submitting JSON data:", jsonData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Candidate data saved",
        description: "The resume information has been successfully saved.",
      });
    } catch (error) {
      console.error("Error saving resume data:", error);
      toast({
        variant: "destructive",
        title: "Failed to save data",
        description: "There was an error saving the resume information.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonData);
    toast({
      title: "JSON copied",
      description: "Resume data JSON copied to clipboard.",
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* File Information */}
      <div className="flex items-center justify-between gap-3 p-4 bg-purple-100 rounded-md border border-purple-200 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-purple-600" />
          <div>
            <p className="font-medium">{parsedFile?.name}</p>
            <p className="text-sm text-purple-700">
              {parsedFile && `${(parsedFile.size / (1024 * 1024)).toFixed(2)} MB`}
            </p>
          </div>
        </div>
        
        <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-purple-300 hover:bg-purple-200 hover:text-purple-800"
            >
              <Code className="w-4 h-4 mr-2" /> View JSON
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Resume Data (JSON)</span>
                <Button 
                  onClick={copyJsonToClipboard} 
                  variant="secondary"
                  size="sm"
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800"
                >
                  Copy to Clipboard
                </Button>
              </DialogTitle>
            </DialogHeader>
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm border border-gray-200 max-h-[60vh]">
              {jsonData}
            </pre>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8 bg-purple-100">
          <TabsTrigger 
            value="personal" 
            className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Personal Info
          </TabsTrigger>
          <TabsTrigger 
            value="education" 
            className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Education
          </TabsTrigger>
          <TabsTrigger 
            value="experience" 
            className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Experience
          </TabsTrigger>
          <TabsTrigger 
            value="skills" 
            className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Skills & Projects
          </TabsTrigger>
          <TabsTrigger 
            value="publications" 
            className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Publications
          </TabsTrigger>
        </TabsList>
        
        {/* Personal Information */}
        <TabsContent value="personal">
          <Card className="shadow-sm border-purple-200">
            <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200">
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={resumeData.personalInfo.name} 
                    onChange={handlePersonalInfoChange}
                    className="border-purple-100 focus-visible:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={resumeData.personalInfo.email} 
                    onChange={handlePersonalInfoChange}
                    className="border-purple-100 focus-visible:ring-purple-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={resumeData.personalInfo.phone} 
                    onChange={handlePersonalInfoChange}
                    className="border-purple-100 focus-visible:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={resumeData.personalInfo.address || ''} 
                    onChange={handlePersonalInfoChange}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary" className="text-sm font-medium">Professional Summary</Label>
                <Textarea 
                  id="summary" 
                  name="summary" 
                  value={resumeData.personalInfo.summary || ''} 
                  onChange={handlePersonalInfoChange}
                  className="min-h-[120px] border-purple-100 focus-visible:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="ugInstitute" className="text-sm font-medium">UG Institute</Label>
                  <Input 
                    id="ugInstitute" 
                    value={resumeData.ugInstitute || ''} 
                    onChange={(e) => setResumeData({...resumeData, ugInstitute: e.target.value})}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pgInstitute" className="text-sm font-medium">PG Institute</Label>
                  <Input 
                    id="pgInstitute" 
                    value={resumeData.pgInstitute || ''} 
                    onChange={(e) => setResumeData({...resumeData, pgInstitute: e.target.value})}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">PhD Institute</Label>
                  <RadioGroup 
                    value={resumeData.phdInstitute.toString()} 
                    onValueChange={(value) => handleRadioChange('phdInstitute', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="phd-no" className="text-purple-600" />
                      <Label htmlFor="phd-no" className="text-sm">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="phd-yes" className="text-purple-600" />
                      <Label htmlFor="phd-yes" className="text-sm">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">J&K Resident</Label>
                  <RadioGroup 
                    value={resumeData.isJK.toString()} 
                    onValueChange={(value) => handleRadioChange('isJK', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="jk-no" className="text-purple-600" />
                      <Label htmlFor="jk-no" className="text-sm">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="jk-yes" className="text-purple-600" />
                      <Label htmlFor="jk-yes" className="text-sm">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Education */}
        <TabsContent value="education">
          <Card className="shadow-sm border-purple-200">
            <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200 flex flex-row items-center justify-between">
              <CardTitle>Education</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addEducation} className="border-purple-300 hover:bg-purple-200 hover:text-purple-800">
                <Plus className="mr-1 h-4 w-4" /> Add Education
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-white">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="space-y-4">
                  {index > 0 && <Separator className="my-6" />}
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-purple-800">Education #{index + 1}</h4>
                    {resumeData.education.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edu-institution-${index}`} className="text-sm font-medium">Institution</Label>
                      <Input 
                        id={`edu-institution-${index}`}
                        value={edu.institution} 
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-degree-${index}`} className="text-sm font-medium">Degree</Label>
                      <Input 
                        id={`edu-degree-${index}`}
                        value={edu.degree} 
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edu-field-${index}`} className="text-sm font-medium">Field of Study</Label>
                      <Input 
                        id={`edu-field-${index}`}
                        value={edu.field || ''} 
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-gpa-${index}`} className="text-sm font-medium">GPA</Label>
                      <Input 
                        id={`edu-gpa-${index}`}
                        value={edu.gpa || ''} 
                        onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edu-start-${index}`} className="text-sm font-medium">Start Date</Label>
                      <Input 
                        id={`edu-start-${index}`}
                        value={edu.startDate || ''} 
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-end-${index}`} className="text-sm font-medium">End Date</Label>
                      <Input 
                        id={`edu-end-${index}`}
                        value={edu.endDate || ''} 
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {resumeData.education.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No education entries found</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addEducation}
                    className="border-purple-300 hover:bg-purple-200 hover:text-purple-800"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Education
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Experience */}
        <TabsContent value="experience">
          <Card className="shadow-sm border-purple-200">
            <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200 flex flex-row items-center justify-between">
              <CardTitle>Work Experience</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addExperience} className="border-purple-300 hover:bg-purple-200 hover:text-purple-800">
                <Plus className="mr-1 h-4 w-4" /> Add Experience
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-white">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="space-y-4">
                  {index > 0 && <Separator className="my-6" />}
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-purple-800">Experience #{index + 1}</h4>
                    {resumeData.experience.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`exp-company-${index}`} className="text-sm font-medium">Company</Label>
                      <Input 
                        id={`exp-company-${index}`}
                        value={exp.company} 
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`exp-position-${index}`} className="text-sm font-medium">Position</Label>
                      <Input 
                        id={`exp-position-${index}`}
                        value={exp.position} 
                        onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`exp-location-${index}`} className="text-sm font-medium">Location</Label>
                      <Input 
                        id={`exp-location-${index}`}
                        value={exp.location || ''} 
                        onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`exp-start-${index}`} className="text-sm font-medium">Start Date</Label>
                      <Input 
                        id={`exp-start-${index}`}
                        value={exp.startDate || ''} 
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`exp-end-${index}`} className="text-sm font-medium">End Date</Label>
                      <Input 
                        id={`exp-end-${index}`}
                        value={exp.endDate || ''} 
                        onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`exp-description-${index}`} className="text-sm font-medium">Description</Label>
                    <Textarea 
                      id={`exp-description-${index}`}
                      value={exp.description || ''} 
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      className="min-h-[100px] border-purple-100 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
              ))}
              
              <Card className="bg-purple-50 shadow-none border-purple-200">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-medium text-lg text-purple-800 mb-4">Experience Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="longevityYears" className="text-sm font-medium">Longevity Years</Label>
                      <Input 
                        id="longevityYears" 
                        type="number"
                        min="0"
                        step="0.1"
                        value={resumeData.longevityYears} 
                        onChange={(e) => handleNumberChange('longevityYears', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                      <p className="text-xs text-purple-700">Working years only (not studying)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfJobs" className="text-sm font-medium">Number of Jobs</Label>
                      <Input 
                        id="numberOfJobs" 
                        type="number"
                        min="0"
                        value={resumeData.numberOfJobs} 
                        onChange={(e) => handleNumberChange('numberOfJobs', e.target.value)}
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="averageExperience" className="text-sm font-medium">Average Experience</Label>
                      <Input 
                        id="averageExperience" 
                        type="number"
                        step="0.01"
                        value={resumeData.averageExperience} 
                        readOnly
                        className="bg-gray-50 border-purple-100"
                      />
                      <p className="text-xs text-purple-700">Longevity / Number of Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {resumeData.experience.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No experience entries found</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addExperience}
                    className="border-purple-300 hover:bg-purple-200 hover:text-purple-800"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Experience
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Skills & Projects */}
        <TabsContent value="skills">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-purple-200">
              <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200">
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skills" className="text-sm font-medium">Skills (comma separated)</Label>
                    <span className="text-sm text-purple-700 font-medium">Count: {resumeData.skillsCount}</span>
                  </div>
                  <Input 
                    id="skills" 
                    value={resumeData.skills.join(', ')} 
                    onChange={handleSkillChange}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {resumeData.skills.map((skill, index) => (
                    <Badge key={index} className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100">
                      {skill}
                    </Badge>
                  ))}
                  
                  {resumeData.skills.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills found</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-purple-200">
              <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200">
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="projects" className="text-sm font-medium">Projects (comma separated)</Label>
                    <span className="text-sm text-purple-700 font-medium">Count: {resumeData.projectsCount}</span>
                  </div>
                  <Input 
                    id="projects" 
                    value={resumeData.projects?.join(', ') || ''} 
                    onChange={(e) => handleStringArrayChange('projects', e.target.value)}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {resumeData.projects?.map((item, index) => (
                    <Badge key={index} className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                      {item}
                    </Badge>
                  ))}
                  
                  {(!resumeData.projects || resumeData.projects.length === 0) && (
                    <p className="text-gray-500 text-sm">No projects found</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-purple-200">
              <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200">
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="achievements" className="text-sm font-medium">Achievements (comma separated)</Label>
                    <span className="text-sm text-purple-700 font-medium">Count: {resumeData.achievementsCount}</span>
                  </div>
                  <Input 
                    id="achievements" 
                    value={resumeData.achievements?.join(', ') || ''} 
                    onChange={(e) => handleStringArrayChange('achievements', e.target.value)}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {resumeData.achievements?.map((item, index) => (
                    <Badge key={index} className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                      {item}
                    </Badge>
                  ))}
                  
                  {(!resumeData.achievements || resumeData.achievements.length === 0) && (
                    <p className="text-gray-500 text-sm">No achievements found</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-purple-200">
              <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200">
                <CardTitle>Training & Workshops</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trainings" className="text-sm font-medium">Trainings (comma separated)</Label>
                      <span className="text-sm text-purple-700 font-medium">Count: {resumeData.trainingsCount}</span>
                    </div>
                    <Input 
                      id="trainings" 
                      value={resumeData.trainings?.join(', ') || ''} 
                      onChange={(e) => handleStringArrayChange('trainings', e.target.value)}
                      className="border-purple-100 focus-visible:ring-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="workshops" className="text-sm font-medium">Workshops (comma separated)</Label>
                      <span className="text-sm text-purple-700 font-medium">Count: {resumeData.workshopsCount}</span>
                    </div>
                    <Input 
                      id="workshops" 
                      value={resumeData.workshops?.join(', ') || ''} 
                      onChange={(e) => handleStringArrayChange('workshops', e.target.value)}
                      className="border-purple-100 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Publications */}
        <TabsContent value="publications">
          <Card className="shadow-sm border-purple-200">
            <CardHeader className="bg-purple-100 pb-3 border-b border-purple-200">
              <CardTitle>Academic Publications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-white">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="researchPapers" className="text-sm font-medium">Research Papers (comma separated)</Label>
                  <Input 
                    id="researchPapers" 
                    value={resumeData.researchPapers?.join(', ') || ''} 
                    onChange={(e) => handleStringArrayChange('researchPapers', e.target.value)}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patents" className="text-sm font-medium">Patents (comma separated)</Label>
                  <Input 
                    id="patents" 
                    value={resumeData.patents?.join(', ') || ''} 
                    onChange={(e) => handleStringArrayChange('patents', e.target.value)}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="books" className="text-sm font-medium">Books (comma separated)</Label>
                  <Input 
                    id="books" 
                    value={resumeData.books?.join(', ') || ''} 
                    onChange={(e) => handleStringArrayChange('books', e.target.value)}
                    className="border-purple-100 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="sticky bottom-0 bg-white p-4 border-t border-purple-200 rounded-md shadow-md">
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowJsonDialog(true)}
            className="border-purple-300 hover:bg-purple-200 hover:text-purple-800"
          >
            <Code className="w-4 h-4 mr-2" /> View JSON Data
          </Button>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.history.back()}
              className="border-purple-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={submitting}
            >
              {submitting ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Candidate Data</>}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
