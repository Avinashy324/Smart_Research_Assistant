// Smart Research Assistant - Main JavaScript

class SmartResearchAssistant {
    constructor() {
        this.currentQuery = null;
        this.sessionId = this.generateSessionId();
        this.credits = 50;
        this.totalReports = 0;
        this.uploadedFiles = [];
        this.progressSteps = ['analyzing', 'searching', 'processing', 'generating'];
        this.currentStep = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeUsage();
        this.setupFileUpload();
        this.loadRecentQueries();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
    }

    bindEvents() {
        // Question input character counter
        const questionInput = document.getElementById('research-question');
        const charCount = document.getElementById('char-count');
        
        questionInput?.addEventListener('input', (e) => {
            const length = e.target.value.length;
            charCount.textContent = length;
            charCount.style.color = length > 450 ? '#ef4444' : '#9ca3af';
        });

        // Generate report button
        document.getElementById('generate-report')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Dashboard modal
        document.getElementById('dashboard-btn')?.addEventListener('click', () => {
            this.showDashboard();
        });

        document.getElementById('close-dashboard')?.addEventListener('click', () => {
            this.hideDashboard();
        });

        // File upload
        document.getElementById('file-upload')?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        const uploadZone = document.querySelector('.border-dashed');
        if (uploadZone) {
            uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        }

        // Reading progress tracking
        window.addEventListener('scroll', this.updateReadingProgress.bind(this));
    }

    async initializeUsage() {
        try {
            // Check for existing usage record
            const response = await fetch('tables/user_usage?search=' + this.sessionId);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const usage = data.data[0];
                this.credits = usage.credits_remaining;
                this.totalReports = usage.total_reports;
            } else {
                // Create new usage record
                await fetch('tables/user_usage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: this.sessionId,
                        credits_remaining: 50,
                        total_queries: 0,
                        total_reports: 0,
                        total_credits_used: 0,
                        last_activity: Date.now()
                    })
                });
            }
            
            this.updateCreditsDisplay();
        } catch (error) {
            console.error('Error initializing usage:', error);
        }
    }

    updateCreditsDisplay() {
        document.getElementById('credits-count').textContent = this.credits;
        document.getElementById('reports-count').textContent = this.totalReports;
    }

    setupFileUpload() {
        const fileInput = document.getElementById('file-upload');
        const uploadedFilesContainer = document.getElementById('uploaded-files');
        
        fileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showNotification('File too large. Maximum size is 10MB.', 'error');
                return;
            }
            
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
                this.showNotification('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.', 'error');
                return;
            }
            
            this.uploadedFiles.push(file);
            this.addFileToDisplay(file);
        });
    }

    addFileToDisplay(file) {
        const container = document.getElementById('uploaded-files');
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-${this.getFileIcon(file.type)}"></i>
                </div>
                <div>
                    <div class="font-medium text-gray-900">${file.name}</div>
                    <div class="text-sm text-gray-500">${fileSize}</div>
                </div>
            </div>
            <button class="remove-file" onclick="researchAssistant.removeFile('${file.name}', this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(fileElement);
    }

    getFileIcon(mimeType) {
        const iconMap = {
            'application/pdf': 'pdf',
            'application/msword': 'word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
            'text/plain': 'alt'
        };
        return iconMap[mimeType] || 'alt';
    }

    removeFile(fileName, element) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== fileName);
        element.parentElement.remove();
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        this.handleFileUpload(e.dataTransfer.files);
    }

    async generateReport() {
        const question = document.getElementById('research-question').value.trim();
        const depth = document.getElementById('report-depth').value;
        const includeNews = document.getElementById('include-news').checked;
        const includeBlogs = document.getElementById('include-blogs').checked;
        
        if (!question) {
            this.showNotification('Please enter a research question.', 'error');
            return;
        }

        if (this.credits < 3) {
            this.showNotification('Insufficient credits. Each report requires 3 credits.', 'error');
            return;
        }

        // Create query record
        const queryId = 'query_' + Date.now();
        this.currentQuery = queryId;
        
        try {
            await fetch('tables/research_queries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: queryId,
                    question: question,
                    depth: depth,
                    include_news: includeNews,
                    include_blogs: includeBlogs,
                    status: 'pending',
                    files_uploaded: this.uploadedFiles.length,
                    file_names: this.uploadedFiles.map(f => f.name),
                    estimated_time: this.calculateEstimatedTime(depth),
                    sources_found: 0,
                    credits_used: 3,
                    created_at: Date.now()
                })
            });

            this.startResearchProcess();
        } catch (error) {
            console.error('Error creating query:', error);
            this.showNotification('Error starting research. Please try again.', 'error');
        }
    }

    calculateEstimatedTime(depth) {
        const timeMap = {
            'brief': 30,
            'detailed': 60,
            'comprehensive': 120
        };
        return timeMap[depth] + (this.uploadedFiles.length * 10);
    }

    async startResearchProcess() {
        // Show progress sidebar
        document.getElementById('progress-sidebar').classList.remove('hidden');
        document.getElementById('progress-sidebar').classList.add('lg:block');
        
        // Disable generate button
        const generateBtn = document.getElementById('generate-report');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating Report...';

        // Update estimated time and sources
        const estimatedTime = this.calculateEstimatedTime(document.getElementById('report-depth').value);
        document.getElementById('estimated-time').textContent = `${Math.floor(estimatedTime / 60)}m ${estimatedTime % 60}s`;
        document.getElementById('sources-count').textContent = '0';

        // Process each step
        for (let i = 0; i < this.progressSteps.length; i++) {
            await this.processStep(this.progressSteps[i], i);
        }

        await this.completeResearch();
    }

    async processStep(step, index) {
        // Update query status
        await this.updateQueryStatus(step);
        
        // Update UI
        this.updateProgressStep(index, 'active');
        
        // Simulate processing time
        const processingTime = {
            'analyzing': 2000,
            'searching': 4000,
            'processing': 6000,
            'generating': 8000
        };
        
        await this.delay(processingTime[step]);
        
        // Mark step as completed
        this.updateProgressStep(index, 'completed');
        
        // Update sources count during search
        if (step === 'searching') {
            await this.simulateSourceSearch();
        }
    }

    async simulateSourceSearch() {
        const sourceCounts = [5, 8, 12, 15, 18];
        for (let count of sourceCounts) {
            document.getElementById('sources-count').textContent = count;
            await this.delay(800);
        }
    }

    updateProgressStep(index, status) {
        const steps = document.querySelectorAll('.progress-step');
        const step = steps[index];
        
        if (status === 'active') {
            step.classList.add('active');
        } else if (status === 'completed') {
            step.classList.remove('active');
            step.classList.add('completed');
        }
    }

    async updateQueryStatus(status) {
        try {
            await fetch(`tables/research_queries/${this.currentQuery}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: status,
                    sources_found: status === 'searching' ? 18 : undefined
                })
            });
        } catch (error) {
            console.error('Error updating query status:', error);
        }
    }

    async completeResearch() {
        // Update final status
        await this.updateQueryStatus('completed');
        await fetch(`tables/research_queries/${this.currentQuery}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                completed_at: Date.now()
            })
        });

        // Generate and display results
        await this.generateResults();
        
        // Update credits and usage
        await this.updateUsage();
        
        // Reset UI
        this.resetGenerateButton();
        
        // Show reading progress
        document.getElementById('reading-progress').classList.remove('hidden');
        
        this.showNotification('Research report generated successfully!', 'success');
    }

    async generateResults() {
        const question = document.getElementById('research-question').value;
        const depth = document.getElementById('report-depth').value;
        
        // Create mock research results
        const resultId = 'result_' + Date.now();
        
        const mockResult = this.generateMockResult(question, depth);
        
        // Save result to database
        await fetch('tables/research_results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: resultId,
                query_id: this.currentQuery,
                ...mockResult,
                created_at: Date.now(),
                updated_at: Date.now()
            })
        });

        // Generate citations
        await this.generateCitations(resultId);
        
        // Display results
        this.displayResults(mockResult, resultId);
    }

    generateMockResult(question, depth) {
        const wordCounts = { brief: 500, detailed: 1500, comprehensive: 3000 };
        const wordCount = wordCounts[depth];
        
        return {
            title: `Research Report: ${question}`,
            summary: `This comprehensive research report examines "${question}" through analysis of multiple sources including academic papers, industry reports, and recent developments. Our investigation reveals key insights and actionable recommendations based on current evidence and expert analysis.`,
            key_findings: [
                "Market analysis shows significant growth potential in the target sector",
                "Current technology trends indicate strong adoption rates",
                "Regulatory environment remains favorable for innovation",
                "Consumer sentiment research reveals positive reception",
                "Competitive landscape analysis identifies key opportunities"
            ],
            detailed_analysis: `
                <h3>Executive Summary</h3>
                <p>Our comprehensive analysis of "${question}" reveals significant opportunities and important considerations for stakeholders. Based on extensive research across multiple credible sources, this report provides actionable insights and strategic recommendations.</p>
                
                <h3>Key Market Insights</h3>
                <p>The current market landscape demonstrates robust growth potential, driven by technological advancement and changing consumer preferences. Industry experts predict continued expansion over the next 3-5 years, with particular strength in emerging market segments.</p>
                
                <h3>Technology and Innovation Trends</h3>
                <p>Recent technological developments have created new possibilities for market expansion and operational efficiency. Leading organizations are investing heavily in research and development to maintain competitive advantages.</p>
                
                <h3>Regulatory and Policy Considerations</h3>
                <p>The regulatory environment continues to evolve, with recent policy changes creating both opportunities and challenges. Compliance requirements are becoming more standardized across jurisdictions.</p>
                
                <h3>Competitive Analysis</h3>
                <p>Market leaders are differentiating through innovation, customer experience, and strategic partnerships. New entrants are finding success by focusing on underserved market segments and leveraging emerging technologies.</p>
            `,
            conclusions: `Based on our comprehensive analysis, the research indicates strong potential for growth and innovation in this space. Key success factors include strategic positioning, technological adaptation, and customer-centric approaches. Organizations should consider both opportunities and risks when developing implementation strategies.`,
            recommendations: [
                "Develop a comprehensive market entry strategy based on identified opportunities",
                "Invest in technology infrastructure to support scalable operations",
                "Build strategic partnerships with key industry players",
                "Monitor regulatory developments and ensure compliance readiness",
                "Implement customer feedback systems for continuous improvement"
            ],
            word_count: wordCount,
            reading_time: Math.ceil(wordCount / 200)
        };
    }

    async generateCitations(resultId) {
        const citations = [
            {
                id: 'citation_' + Date.now() + '_1',
                result_id: resultId,
                source_type: 'academic',
                title: 'Market Research Analysis and Trends',
                url: 'https://example.com/research-paper-1',
                author: 'Dr. Sarah Johnson',
                publication_date: Date.now() - 86400000 * 30,
                excerpt: 'The analysis reveals significant growth patterns in the target market, with adoption rates exceeding initial projections by 25%.',
                relevance_score: 95,
                created_at: Date.now()
            },
            {
                id: 'citation_' + Date.now() + '_2',
                result_id: resultId,
                source_type: 'news',
                title: 'Industry Report: Latest Developments',
                url: 'https://example.com/industry-news',
                author: 'TechNews Editorial',
                publication_date: Date.now() - 86400000 * 7,
                excerpt: 'Recent industry developments suggest a shift toward more sustainable and efficient practices across the sector.',
                relevance_score: 88,
                created_at: Date.now()
            },
            {
                id: 'citation_' + Date.now() + '_3',
                result_id: resultId,
                source_type: 'blog',
                title: 'Expert Opinion: Future Outlook',
                url: 'https://example.com/expert-blog',
                author: 'Michael Chen',
                publication_date: Date.now() - 86400000 * 14,
                excerpt: 'Industry experts predict continued growth driven by technological innovation and changing consumer preferences.',
                relevance_score: 82,
                created_at: Date.now()
            }
        ];

        for (const citation of citations) {
            await fetch('tables/citations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(citation)
            });
        }
    }

    displayResults(result, resultId) {
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        
        resultsSection.innerHTML = `
            <div class="research-result">
                <div class="result-header">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-3xl font-bold text-gray-900">${result.title}</h2>
                        <div class="flex items-center space-x-4">
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <i class="fas fa-check-circle mr-1"></i>Completed
                            </span>
                            <span class="text-sm text-gray-600">
                                <i class="fas fa-clock mr-1"></i>${result.reading_time} min read
                            </span>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-sm text-gray-600">Word Count</div>
                            <div class="text-lg font-semibold text-gray-900">${result.word_count.toLocaleString()}</div>
                        </div>
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-sm text-gray-600">Sources</div>
                            <div class="text-lg font-semibold text-gray-900">18</div>
                        </div>
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-sm text-gray-600">Citations</div>
                            <div class="text-lg font-semibold text-gray-900">3</div>
                        </div>
                    </div>
                </div>

                <div class="result-content">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
                    <p class="text-gray-700 mb-6 leading-relaxed">${result.summary}</p>
                    
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Key Findings</h3>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        ${result.key_findings.map(finding => `<li class="text-gray-700">${finding}</li>`).join('')}
                    </ul>
                    
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                    <div class="prose prose-blue max-w-none mb-6">${result.detailed_analysis}</div>
                    
                    <div class="citation">
                        <h4 class="font-semibold text-blue-700 mb-2">
                            <i class="fas fa-quote-left mr-2"></i>Market Research Analysis and Trends
                        </h4>
                        <p class="text-gray-700 mb-2">"The analysis reveals significant growth patterns in the target market, with adoption rates exceeding initial projections by 25%."</p>
                        <a href="#" class="citation-source text-sm">Dr. Sarah Johnson - Academic Research</a>
                    </div>
                    
                    <h3 class="text-xl font-semibold text-gray-900 mb-4 mt-8">Recommendations</h3>
                    <ol class="list-decimal pl-6 mb-6 space-y-2">
                        ${result.recommendations.map(rec => `<li class="text-gray-700">${rec}</li>`).join('')}
                    </ol>
                    
                    <div class="citation">
                        <h4 class="font-semibold text-blue-700 mb-2">
                            <i class="fas fa-quote-left mr-2"></i>Industry Report: Latest Developments
                        </h4>
                        <p class="text-gray-700 mb-2">"Recent industry developments suggest a shift toward more sustainable and efficient practices across the sector."</p>
                        <a href="#" class="citation-source text-sm">TechNews Editorial - Industry News</a>
                    </div>
                    
                    <h3 class="text-xl font-semibold text-gray-900 mb-4 mt-8">Conclusions</h3>
                    <p class="text-gray-700 mb-6 leading-relaxed">${result.conclusions}</p>
                    
                    <div class="citation">
                        <h4 class="font-semibold text-blue-700 mb-2">
                            <i class="fas fa-quote-left mr-2"></i>Expert Opinion: Future Outlook
                        </h4>
                        <p class="text-gray-700 mb-2">"Industry experts predict continued growth driven by technological innovation and changing consumer preferences."</p>
                        <a href="#" class="citation-source text-sm">Michael Chen - Expert Blog</a>
                    </div>
                </div>
                
                <div class="flex justify-center space-x-4 mt-8">
                    <button onclick="researchAssistant.exportReport('${resultId}')" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>Export PDF
                    </button>
                    <button onclick="researchAssistant.shareReport('${resultId}')" class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        <i class="fas fa-share mr-2"></i>Share Report
                    </button>
                    <button onclick="researchAssistant.newResearch()" class="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        <i class="fas fa-plus mr-2"></i>New Research
                    </button>
                </div>
            </div>
        `;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    async updateUsage() {
        this.credits -= 3;
        this.totalReports += 1;
        
        try {
            const response = await fetch('tables/user_usage?search=' + this.sessionId);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const usage = data.data[0];
                await fetch(`tables/user_usage/${usage.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        credits_remaining: this.credits,
                        total_reports: this.totalReports,
                        total_credits_used: usage.total_credits_used + 3,
                        last_activity: Date.now(),
                        updated_at: Date.now()
                    })
                });
            }
        } catch (error) {
            console.error('Error updating usage:', error);
        }
        
        this.updateCreditsDisplay();
    }

    resetGenerateButton() {
        const generateBtn = document.getElementById('generate-report');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate Research Report';
    }

    updateReadingProgress() {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection.classList.contains('hidden')) return;
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        const readingBar = document.getElementById('reading-bar');
        const readingPercentage = document.getElementById('reading-percentage');
        
        if (readingBar && readingPercentage) {
            readingBar.style.width = Math.min(scrollPercent, 100) + '%';
            readingPercentage.textContent = Math.round(Math.min(scrollPercent, 100)) + '% complete';
        }
    }

    async showDashboard() {
        const modal = document.getElementById('dashboard-modal');
        const content = document.getElementById('dashboard-content');
        
        // Load dashboard data
        const [queries, results, usage] = await Promise.all([
            this.loadQueries(),
            this.loadResults(),
            this.loadUsage()
        ]);
        
        content.innerHTML = `
            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <div class="stat-card">
                    <div class="stat-number">${usage.total_reports || 0}</div>
                    <div class="stat-label">Reports Generated</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${usage.credits_remaining || 0}</div>
                    <div class="stat-label">Credits Remaining</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${usage.total_credits_used || 0}</div>
                    <div class="stat-label">Credits Used</div>
                </div>
            </div>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Recent Research Queries</h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
                ${queries.map(query => `
                    <div class="query-item">
                        <div class="flex items-center justify-between mb-2">
                            <span class="query-status ${query.status}">${query.status}</span>
                            <span class="query-timestamp">${new Date(query.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="query-text">${query.question}</div>
                        <div class="text-xs text-gray-500 mt-2">
                            Files: ${query.files_uploaded} | Sources: ${query.sources_found} | Credits: ${query.credits_used}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideDashboard() {
        const modal = document.getElementById('dashboard-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async loadQueries() {
        try {
            const response = await fetch('tables/research_queries?limit=10&sort=created_at');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error loading queries:', error);
            return [];
        }
    }

    async loadResults() {
        try {
            const response = await fetch('tables/research_results?limit=10&sort=created_at');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error loading results:', error);
            return [];
        }
    }

    async loadUsage() {
        try {
            const response = await fetch('tables/user_usage?search=' + this.sessionId);
            const data = await response.json();
            return data.data && data.data.length > 0 ? data.data[0] : {};
        } catch (error) {
            console.error('Error loading usage:', error);
            return {};
        }
    }

    async loadRecentQueries() {
        // This would typically load recent queries for the user
        // For now, we'll just ensure the UI is ready
    }

    exportReport(resultId) {
        this.showNotification('Export functionality will be implemented in the next version.', 'info');
    }

    shareReport(resultId) {
        this.showNotification('Share functionality will be implemented in the next version.', 'info');
    }

    newResearch() {
        // Reset form
        document.getElementById('research-question').value = '';
        document.getElementById('research-question').dispatchEvent(new Event('input'));
        document.getElementById('uploaded-files').innerHTML = '';
        this.uploadedFiles = [];
        
        // Hide results
        document.getElementById('results-section').classList.add('hidden');
        document.getElementById('progress-sidebar').classList.add('hidden');
        document.getElementById('reading-progress').classList.add('hidden');
        
        // Reset progress steps
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.showNotification('Ready for new research query!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-x-full`;
        
        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.classList.add(bgColors[type]);
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="${icons[type]} mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.researchAssistant = new SmartResearchAssistant();
});