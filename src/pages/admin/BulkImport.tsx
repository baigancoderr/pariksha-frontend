import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Exam, Subject } from '@/types';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const BulkImport: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<{ total: number; success: number; failed: number } | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    fetchExams();
  }, []);

  React.useEffect(() => {
    if (selectedExam) {
      fetchSubjects(selectedExam);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      if (response.data.success) {
        setExams(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
  };

  const fetchSubjects = async (examId: string) => {
    try {
      const response = await api.get(`/subjects?exam=${examId}`);
      if (response.data.success) {
        setSubjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'csv' && fileExt !== 'xlsx') {
        toast.error('Please upload a CSV or XLSX file');
        return;
      }
      setFile(selectedFile);
      setValidationErrors([]);
      setUploadSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!selectedExam || !selectedSubject) {
      toast.error('Please select exam and subject');
      return;
    }

    try {
      setIsUploading(true);
      setValidationErrors([]);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('exam_id', selectedExam);
      formData.append('subject_id', selectedSubject);

      const response = await api.post('/questions/bulk-import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const { imported, failed, errors } = response.data.data;
        setUploadSuccess({
          total: imported + failed,
          success: imported,
          failed: failed,
        });

        if (errors && errors.length > 0) {
          setValidationErrors(errors);
        }

        if (failed === 0) {
          toast.success(`Successfully imported ${imported} questions`);
        } else {
          toast.warning(`Imported ${imported} questions, ${failed} failed`);
        }

        // Reset file
        setFile(null);
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to upload file');

      if (error.response?.data?.error?.details?.errors) {
        setValidationErrors(error.response.data.error.details.errors);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // CSV Headers
    const headers = [
      'question_en',
      'question_hi',
      'option1_en',
      'option1_hi',
      'option2_en',
      'option2_hi',
      'option3_en',
      'option3_hi',
      'option4_en',
      'option4_hi',
      'correct_option',
      'explanation_en',
      'explanation_hi',
      'difficulty',
      'marks_correct',
      'marks_incorrect',
      'tags'
    ].join(',');

    // Sample rows with proper CSV formatting
    const samples = [
      // Row 1: History question
      '"Who was the first President of India?","भारत के प्रथम राष्ट्रपति कौन थे?","Dr. Rajendra Prasad","डॉ. राजेंद्र प्रसाद","Jawaharlal Nehru","जवाहरलाल नेहरू","Mahatma Gandhi","महात्मा गांधी","Sardar Patel","सरदार पटेल",A,"Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.","डॉ. राजेंद्र प्रसाद भारत के प्रथम राष्ट्रपति थे, जिन्होंने 1950 से 1962 तक सेवा की।",easy,1,0.25,"history,president,india"',
      
      // Row 2: Geography question
      '"What is the capital of France?","फ्रांस की राजधानी क्या है?","London","लंदन","Paris","पेरिस","Berlin","बर्लिन","Madrid","मैड्रिड",B,"Paris is the capital and most populous city of France.","पेरिस फ्रांस की राजधानी और सबसे अधिक आबादी वाला शहर है।",easy,1,0.25,"geography,capitals,world"',
      
      // Row 3: Math question
      '"What is 15 + 27?","15 + 27 कितना होता है?",40,40,42,42,45,45,52,52,B,"15 + 27 = 42. Simple addition of two numbers.","15 + 27 = 42. दो संख्याओं का सरल जोड़।",easy,1,0.25,"math,addition,arithmetic"',
      
      // Row 4: Science question
      '"Which planet is known as the Red Planet?","किस ग्रह को लाल ग्रह के नाम से जाना जाता है?","Venus","शुक्र","Mars","मंगल","Jupiter","बृहस्पति","Saturn","शनि",B,"Mars is called the Red Planet due to iron oxide (rust) on its surface.","मंगल को इसकी सतह पर आयरन ऑक्साइड (जंग) के कारण लाल ग्रह कहा जाता है।",medium,1,0.25,"science,planets,astronomy"',
      
      // Row 5: Simple English-only example
      '"What is 2 + 2?","2 + 2 क्या है?",2,2,3,3,4,4,5,5,C,"2 + 2 equals 4. Basic arithmetic.","2 + 2 बराबर 4 होता है। मूल अंकगणित।",easy,1,0.25,"math,basic"'
    ];

    // Create CSV content
    const csvContent = [headers, ...samples].join('\n');
    
    // Add BOM for UTF-8 (helps Excel open Hindi text correctly)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Question Import</h1>
          <p className="mt-1 text-sm text-gray-600">Upload CSV or Excel file to import multiple questions at once</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Template
        </Button>
      </div>

      {/* Instructions */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">📋 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li><strong>Download Template:</strong> Click "Download Template" button to get CSV with proper format</li>
            <li><strong>AI-Friendly:</strong> You can give this template to AI (ChatGPT, Claude, etc.) and ask it to generate questions</li>
            <li><strong>Correct Option:</strong> Use <code className="bg-gray-100 px-1 py-0.5 rounded">A</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">B</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">C</code>, or <code className="bg-gray-100 px-1 py-0.5 rounded">D</code> for correct_option</li>
            <li><strong>Difficulty:</strong> Use <code className="bg-gray-100 px-1 py-0.5 rounded">easy</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">medium</code>, or <code className="bg-gray-100 px-1 py-0.5 rounded">hard</code></li>
            <li><strong>Tags:</strong> Comma-separated (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded">history,india,presidents</code>)</li>
            <li><strong>Hindi (Optional):</strong> Hindi translations recommended but not required</li>
            <li><strong>Marks:</strong> marks_correct (default: 1), marks_incorrect (default: 0.25)</li>
            <li><strong>Save as UTF-8:</strong> Important for Hindi text support</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Pro Tip:</strong> You can prompt AI like this:<br/>
              <em className="text-blue-700">"Generate 50 questions for MP Police exam following this exact CSV format: [paste template]"</em>
            </p>
          </div>
        </div>
      </Card>

      {/* Upload Form */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>

          {/* Exam and Subject Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Exam"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              options={exams.map((exam) => ({
                value: exam._id,
                label: exam.name.en,
              }))}
              placeholder="Select Exam"
              required
            />
            <Select
              label="Subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={subjects.map((subject) => ({
                value: subject._id,
                label: subject.name.en,
              }))}
              placeholder="Select Subject"
              disabled={!selectedExam}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  cursor-pointer"
              />
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || !selectedExam || !selectedSubject || isUploading}
                isLoading={isUploading}
              >
                Upload
              </Button>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <div className="flex items-center gap-4">
            <Loader size="md" />
            <div>
              <p className="font-medium text-gray-900">Processing file...</p>
              <p className="text-sm text-gray-600">Please wait while we validate and import your questions</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Summary */}
      {uploadSuccess && (
        <Card>
          <Alert
            type={uploadSuccess.failed === 0 ? 'success' : 'warning'}
            title="Import Complete"
            message={`Successfully imported ${uploadSuccess.success} out of ${uploadSuccess.total} questions${
              uploadSuccess.failed > 0 ? `. ${uploadSuccess.failed} questions failed validation.` : ''
            }`}
          />
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-900">⚠️ Validation Errors</h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {validationErrors.map((error, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{error.row}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{error.field}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{error.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* CSV Format Example */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">📄 CSV Format Guide</h3>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Column Structure:</p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap max-w-full">
{`question_en,question_hi,option1_en,option1_hi,option2_en,option2_hi,option3_en,option3_hi,option4_en,option4_hi,correct_option,explanation_en,explanation_hi,difficulty,marks_correct,marks_incorrect,tags`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Example Row:</p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap max-w-full">
{`"What is 2+2?","2+2 क्या है?",2,2,3,3,4,4,5,5,C,"2+2 equals 4","2+2 बराबर 4 है",easy,1,0.25,"math,basic"`}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">✅ Correct Format:</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Use A, B, C, D for correct_option</li>
                <li>• Use lowercase: easy, medium, hard</li>
                <li>• Quote text with commas: "text, here"</li>
                <li>• UTF-8 encoding for Hindi</li>
                <li>• Numbers without quotes: 1, 0.25</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">❌ Common Mistakes:</p>
              <ul className="text-xs text-red-800 space-y-1">
                <li>• Using 1,2,3,4 instead of A,B,C,D</li>
                <li>• UPPERCASE: EASY instead of easy</li>
                <li>• Missing quotes for text with commas</li>
                <li>• Wrong encoding (not UTF-8)</li>
                <li>• Empty required fields</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>💡 AI Prompt Template:</strong><br/>
              <code className="text-xs bg-yellow-100 p-2 rounded block mt-2 break-all whitespace-pre-wrap max-w-full overflow-x-auto">
{`Generate 20 questions for [SUBJECT] following this EXACT CSV format (including header):

question_en,question_hi,option1_en,option1_hi,option2_en,option2_hi,option3_en,option3_hi,option4_en,option4_hi,correct_option,explanation_en,explanation_hi,difficulty,marks_correct,marks_incorrect,tags

Requirements:
- correct_option: A, B, C, or D (not 1,2,3,4)
- difficulty: easy, medium, or hard (lowercase)
- marks_correct: 1 (number, no quotes)
- marks_incorrect: 0.25 (number, no quotes)
- Quote all text fields containing commas
- Include proper Hindi translations
- Add relevant tags separated by commas`}
              </code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
