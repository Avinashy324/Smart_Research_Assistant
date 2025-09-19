# Smart Research Assistant

A comprehensive AI-powered research assistant that generates structured, evidence-based reports with citations from uploaded files and real-time data sources.

Link to the site : https://merry-haupia-9aa80d.netlify.app/

## 🚀 Features

### ✅ Currently Implemented

1. **Modern UI Design**
   - Vibrant, user-friendly interface with glass morphism effects
   - Responsive design that works on all devices
   - Smooth animations and hover effects
   - Progress tracking with interactive sidebar

2. **Research Question Input**
   - Multi-line textarea with character counter (500 char limit)
   - Real-time validation and feedback
   - Auto-expanding input field

3. **File Upload System**
   - Drag-and-drop file upload interface
   - Support for PDF, DOC, DOCX, and TXT files
   - 10MB file size limit per file
   - Visual file management with remove functionality
   - File type validation and error handling

4. **Research Configuration**
   - Report depth selection (Brief, Detailed, Comprehensive)
   - Live source toggles (Latest News, Blog Posts)
   - Estimated time and credit calculation

5. **Interactive Progress Tracking**
   - Real-time progress sidebar with 4 processing steps
   - Reading progress bar for generated reports
   - Source counting animation
   - Step-by-step visual feedback

6. **Credit and Usage System**
   - Credit tracking and display (starts with 50 credits)
   - Usage counters (reports generated, credits used)
   - Per-query billing (3 credits per report)
   - Session-based user tracking

7. **Research Report Generation**
   - Structured report layout with sections:
     - Executive Summary
     - Key Findings (bulleted list)
     - Detailed Analysis (rich text)
     - Recommendations (numbered list)
     - Conclusions
   - Word count and reading time estimation
   - Professional formatting with typography

8. **Citation System**
   - Inline citations with source attribution
   - Multiple source types (academic, news, blog, website, uploaded files)
   - Citation excerpts with relevance scoring
   - Source links and author information

9. **Dashboard and Analytics**
   - Usage statistics (reports generated, credits remaining/used)
   - Query history with status tracking
   - Modal-based dashboard interface
   - Real-time data updates

10. **Data Persistence**
    - RESTful API integration for data storage
    - Four data tables: research_queries, research_results, citations, user_usage
    - Automatic session management
    - Query and result tracking

### 🎨 UI/UX Features

- **Glass morphism design** with backdrop blur effects
- **Gradient backgrounds** and vibrant color schemes
- **Smooth animations** for all interactions
- **Hover effects** and transitions
- **Mobile-responsive** layout
- **Reading progress tracking** during report review
- **Interactive file upload** with drag-and-drop
- **Real-time notifications** for user feedback
- **Loading states** and progress indicators

## 🛠 Technical Implementation

### Frontend Architecture
- **HTML5** semantic structure
- **Tailwind CSS** for utility-first styling
- **Custom CSS** for animations and effects
- **Vanilla JavaScript** ES6+ class-based architecture
- **Font Awesome** icons
- **Google Fonts** (Inter typeface)

### Data Models
1. **research_queries**: Query tracking and metadata
2. **research_results**: Generated report content
3. **citations**: Source references and excerpts
4. **user_usage**: Credit and usage tracking

### API Integration
- RESTful endpoints for CRUD operations
- Session-based user identification
- Real-time data synchronization
- Error handling and validation

## 🎯 Current Entry Points

### Main Interface (`/`)
- **Primary Action**: Research question input and report generation
- **Parameters**: 
  - Question text (required, max 500 chars)
  - Report depth (brief/detailed/comprehensive)
  - File uploads (optional, PDF/DOC/DOCX/TXT)
  - Live source preferences (news/blogs toggles)

### Dashboard (`dashboard-btn`)
- **Function**: Usage analytics and query history
- **Data Displayed**:
  - Credits remaining/used
  - Reports generated count
  - Recent query history with status

### Progress Tracking (`progress-sidebar`)
- **Real-time Updates**: Processing step visualization
- **Reading Progress**: Scroll-based progress bar
- **Statistics**: Estimated time, sources found

## 🔄 User Flow

1. **Landing**: User sees welcome screen with feature overview
2. **Input**: User enters research question and configures options
3. **Upload**: Optional file uploads with drag-and-drop
4. **Generate**: Click to start research process (3 credits)
5. **Progress**: Real-time progress tracking with step updates
6. **Results**: Comprehensive report display with citations
7. **Review**: Reading progress tracking and report navigation
8. **Actions**: Export, share, or start new research

## ⚠️ Features Not Yet Implemented

1. **Backend AI Processing**
   - Actual document analysis and content extraction
   - Real-time web scraping for news/blog sources
   - AI-powered report generation and synthesis

2. **Export Functionality**
   - PDF export generation
   - Report sharing capabilities
   - Download management

3. **Advanced Features**
   - User authentication and accounts
   - Payment processing integration
   - Advanced search filters
   - Collaborative research tools

4. **Live Data Integration**
   - Pathway integration for incremental data ingestion
   - Real-time news/blog feed processing
   - Dynamic source updates

## 🎯 Recommended Next Steps

### Phase 1: Core AI Integration
1. Implement actual document processing pipeline
2. Add real web scraping for live sources
3. Integrate AI/LLM APIs for content analysis
4. Implement Pathway for incremental data processing

### Phase 2: Export and Sharing
1. Add PDF export functionality using libraries like jsPDF
2. Implement sharing mechanisms (email, social, direct links)
3. Create report templates and formatting options

### Phase 3: User Management
1. Add user authentication system
2. Implement payment processing (Flexprice integration)
3. Create user profiles and preferences
4. Add collaborative features

### Phase 4: Advanced Analytics
1. Add detailed usage analytics
2. Implement A/B testing for UI improvements
3. Create admin dashboard for system monitoring
4. Add feedback and rating systems

## 🏗 Project Structure

```
├── index.html              # Main application interface
├── css/
│   └── style.css          # Custom styles and animations
├── js/
│   └── main.js           # Core application logic
└── README.md             # Project documentation
```

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS, Custom CSS
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Data**: RESTful API with JSON
- **Storage**: Session-based table system

## 📱 Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Design System

### Colors
- **Primary**: Blue-Purple gradient (#3b82f6 to #8b5cf6)
- **Success**: Green gradient (#10b981 to #059669)
- **Warning**: Amber gradient (#f59e0b to #d97706)
- **Error**: Red gradient (#ef4444 to #dc2626)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Sizes**: Responsive scaling with Tailwind utilities

### Effects
- **Glass morphism** with backdrop-filter blur
- **Smooth transitions** (0.3s cubic-bezier)
- **Hover animations** with transform and shadow
- **Loading states** with spin and pulse animations

---

## 💡 Usage Instructions

1. **Start Research**: Enter your question in the main textarea
2. **Configure Options**: Select report depth and source preferences  
3. **Upload Files** (optional): Drag and drop or click to upload supporting documents
4. **Generate Report**: Click the generate button (requires 3 credits)
5. **Track Progress**: Watch real-time progress in the sidebar
6. **Review Results**: Read the generated report with citations
7. **Take Action**: Export, share, or start new research

The application is designed to be intuitive and user-friendly, with clear visual feedback at every step of the research process.
