import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdmissionFormService {
  constructor(private db: DatabaseService) {}

  async generateBlankAdmissionForm(): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set page format
      await page.setViewport({ width: 1200, height: 1600 });
      
      const htmlContent = this.generateBlankFormHTML();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async generateFilledAdmissionForm(studentId: string): Promise<Buffer> {
    const student = await this.db.student.findUnique({
      where: { id: studentId },
      include: {
        section: {
          include: {
            class: true,
            department: true
          }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1200, height: 1600 });
      
      const htmlContent = this.generateFilledFormHTML(student);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private generateBlankFormHTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Student Admission Form</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: white;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .school-name {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            .school-address {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
            }
            .form-title {
                font-size: 20px;
                font-weight: bold;
                color: #e74c3c;
                margin-top: 15px;
            }
            .form-section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2980b9;
                margin-bottom: 15px;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 5px;
            }
            .form-row {
                display: flex;
                margin-bottom: 15px;
                align-items: center;
            }
            .form-group {
                flex: 1;
                margin-right: 20px;
            }
            .form-group:last-child {
                margin-right: 0;
            }
            .form-label {
                font-weight: bold;
                margin-bottom: 5px;
                display: block;
                color: #34495e;
            }
            .form-input {
                border: none;
                border-bottom: 1px solid #333;
                padding: 5px 0;
                width: 100%;
                font-size: 14px;
                background: transparent;
            }
            .checkbox-group {
                display: flex;
                gap: 20px;
                margin-top: 5px;
            }
            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .photo-box {
                width: 120px;
                height: 150px;
                border: 2px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #666;
                margin-left: 20px;
            }
            .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
            }
            .signature-box {
                text-align: center;
                width: 200px;
            }
            .signature-line {
                border-bottom: 1px solid #333;
                height: 50px;
                margin-bottom: 10px;
            }
            .instructions {
                background-color: #f8f9fa;
                padding: 15px;
                border-left: 4px solid #3498db;
                margin-bottom: 20px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="school-name">St. Helena Mission, Nayapara, Dhaka-1200</div>
            <div class="school-address">Phone: 01912345678 | Email: info@sthelenamission.edu</div>
            <div class="form-title">ADMISSION FORM</div>
        </div>

        <div class="instructions">
            <strong>Instructions:</strong>
            <ul>
                <li>Please fill out all sections completely in BLOCK LETTERS</li>
                <li>Attach a recent passport-size photograph</li>
                <li>Submit required documents along with this form</li>
                <li>Incomplete forms will not be processed</li>
            </ul>
        </div>

        <div class="form-section">
            <div class="section-title">Personal Information</div>
            
            <div class="form-row">
                <div class="form-group" style="flex: 3;">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Student's Name *</label>
                            <input type="text" class="form-input" placeholder="">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Roll Number</label>
                            <input type="text" class="form-input" placeholder="">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Date of Birth *</label>
                            <input type="text" class="form-input" placeholder="DD/MM/YYYY">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Student ID</label>
                            <input type="text" class="form-input" placeholder="">
                        </div>
                    </div>
                </div>
                
                <div class="photo-box">
                    Paste Recent<br>Passport Size<br>Photograph
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Gender *</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox"> Male
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox"> Female
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox"> Other
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Blood Group</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Medium *</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox"> Bangla
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox"> English
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Class *</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Section</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
                <div class="form-group">
                    <label class="form-label">Shift</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox"> Morning
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox"> Day
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox"> Evening
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Department</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
                <div class="form-group">
                    <label class="form-label">Academic Year</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>
        </div>

        <div class="form-section">
            <div class="section-title">Contact Information</div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Guardian's Name *</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
                <div class="form-group">
                    <label class="form-label">Phone (SMS) *</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Father's Name</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
                <div class="form-group">
                    <label class="form-label">Mother's Name</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
                <div class="form-group">
                    <label class="form-label">Father's Contact</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Address *</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
                <div class="form-group">
                    <label class="form-label">Mother's Contact</label>
                    <input type="text" class="form-input" placeholder="">
                </div>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Guardian's Signature</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Student's Signature</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Date</div>
            </div>
        </div>

        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            <p><strong>For Office Use Only</strong></p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>Application Received: _______________</div>
                <div>Processed By: _______________</div>
                <div>Admission Date: _______________</div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateFilledFormHTML(student: any): string {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-GB');
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Student Admission Form - ${student.firstName} ${student.lastName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: white;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .school-name {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            .school-address {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
            }
            .form-title {
                font-size: 20px;
                font-weight: bold;
                color: #e74c3c;
                margin-top: 15px;
            }
            .form-section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2980b9;
                margin-bottom: 15px;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 5px;
            }
            .form-row {
                display: flex;
                margin-bottom: 15px;
                align-items: center;
            }
            .form-group {
                flex: 1;
                margin-right: 20px;
            }
            .form-group:last-child {
                margin-right: 0;
            }
            .form-label {
                font-weight: bold;
                margin-bottom: 5px;
                display: block;
                color: #34495e;
            }
            .form-value {
                border-bottom: 1px solid #333;
                padding: 5px 0;
                min-height: 20px;
                font-size: 14px;
                color: #2c3e50;
            }
            .checkbox-group {
                display: flex;
                gap: 20px;
                margin-top: 5px;
            }
            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .checkbox-checked {
                font-weight: bold;
                color: #e74c3c;
            }
            .photo-box {
                width: 120px;
                height: 150px;
                border: 2px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #666;
                margin-left: 20px;
                background-color: #f8f9fa;
            }
            .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
            }
            .signature-box {
                text-align: center;
                width: 200px;
            }
            .signature-line {
                border-bottom: 1px solid #333;
                height: 50px;
                margin-bottom: 10px;
            }
            .status-badge {
                background-color: #27ae60;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="school-name">St. Helena Mission, Nayapara, Dhaka-1200</div>
            <div class="school-address">Phone: 01912345678 | Email: info@sthelenamission.edu</div>
            <div class="form-title">ADMISSION FORM <span class="status-badge">COMPLETED</span></div>
        </div>

        <div class="form-section">
            <div class="section-title">Personal Information</div>
            
            <div class="form-row">
                <div class="form-group" style="flex: 3;">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Student's Name *</label>
                            <div class="form-value">${student.firstName} ${student.lastName}</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Roll Number</label>
                            <div class="form-value">${student.rollNumber || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Date of Birth *</label>
                            <div class="form-value">${formatDate(student.dateOfBirth)}</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Student ID</label>
                            <div class="form-value">${student.admissionNo || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="photo-box">
                    Student<br>Photograph
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Gender *</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item ${student.gender === 'MALE' ? 'checkbox-checked' : ''}">
                            ${student.gender === 'MALE' ? '☑' : '☐'} Male
                        </div>
                        <div class="checkbox-item ${student.gender === 'FEMALE' ? 'checkbox-checked' : ''}">
                            ${student.gender === 'FEMALE' ? '☑' : '☐'} Female
                        </div>
                        <div class="checkbox-item ${student.gender === 'OTHER' ? 'checkbox-checked' : ''}">
                            ${student.gender === 'OTHER' ? '☑' : '☐'} Other
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Blood Group</label>
                    <div class="form-value">${student.bloodGroup || 'N/A'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Medium *</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item ${student.medium === 'BANGLA' ? 'checkbox-checked' : ''}">
                            ${student.medium === 'BANGLA' ? '☑' : '☐'} Bangla
                        </div>
                        <div class="checkbox-item ${student.medium === 'ENGLISH' ? 'checkbox-checked' : ''}">
                            ${student.medium === 'ENGLISH' ? '☑' : '☐'} English
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Class *</label>
                    <div class="form-value">${student.section?.class?.name || 'N/A'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Section</label>
                    <div class="form-value">${student.section?.name || 'N/A'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Shift</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item ${student.shift === 'MORNING' ? 'checkbox-checked' : ''}">
                            ${student.shift === 'MORNING' ? '☑' : '☐'} Morning
                        </div>
                        <div class="checkbox-item ${student.shift === 'DAY' ? 'checkbox-checked' : ''}">
                            ${student.shift === 'DAY' ? '☑' : '☐'} Day
                        </div>
                        <div class="checkbox-item ${student.shift === 'EVENING' ? 'checkbox-checked' : ''}">
                            ${student.shift === 'EVENING' ? '☑' : '☐'} Evening
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Department</label>
                    <div class="form-value">${student.section?.department?.name || 'N/A'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Academic Year</label>
                    <div class="form-value">${student.academicYear || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="form-section">
            <div class="section-title">Contact Information</div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Guardian's Name *</label>
                    <div class="form-value">${student.fatherName || 'N/A'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone (SMS) *</label>
                    <div class="form-value">${student.parentPhone || 'N/A'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Father's Name</label>
                    <div class="form-value">${student.fatherName || 'N/A'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Mother's Name</label>
                    <div class="form-value">${student.motherName || 'N/A'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <div class="form-value">${student.parentEmail || 'N/A'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Father's Contact</label>
                    <div class="form-value">${student.parentPhone || 'N/A'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Address *</label>
                    <div class="form-value">${student.address || 'N/A'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Mother's Contact</label>
                    <div class="form-value">${student.parentPhone || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Guardian's Signature</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Student's Signature</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Date: ${formatDate(student.admissionDate || new Date())}</div>
            </div>
        </div>

        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            <p><strong>For Office Use Only</strong></p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>Application Received: ${formatDate(student.admissionDate || new Date())}</div>
                <div>Processed By: Admin</div>
                <div>Admission Date: ${formatDate(student.admissionDate || new Date())}</div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}