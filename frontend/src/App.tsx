import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, Bell, ExternalLink, FileText, Users, Clock, ChevronDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from './services/api';
import { PolicyDocument, StatsResponse } from './types/api';

const PolicyRadarDashboard = () => {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // API state
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [allDocTypes, setAllDocTypes] = useState<string[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Load initial data
  useEffect(() => {
    loadDocuments();
    loadStats();
    loadFilterOptions();
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      loadDocuments();
      loadStats();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Reload documents when filters change
  useEffect(() => {
    loadDocuments();
  }, [selectedTopic, selectedSource, selectedDocType, dateRange, searchQuery]);
  
  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setError(null);
      
      const response = await apiClient.getDocuments({
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
        source: selectedSource !== 'all' ? selectedSource : undefined,
        doc_type: selectedDocType !== 'all' ? selectedDocType : undefined,
        days: parseInt(dateRange),
        search: searchQuery || undefined,
      });
      
      setDocuments(response.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setDocumentsLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await apiClient.getStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };
  
  const loadFilterOptions = async () => {
    try {
      const [topicsResponse, sourcesResponse] = await Promise.all([
        apiClient.getTopics(),
        apiClient.getSources()
      ]);
      
      setAllTopics(topicsResponse.topics.map(t => t.name));
      setAllSources(sourcesResponse.sources.map(s => s.name));
      
      // Extract doc types from documents
      const docTypesSet = new Set<string>();
      documents.forEach(doc => docTypesSet.add(doc.doc_type));
      setAllDocTypes(Array.from(docTypesSet));
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  // Filtered data is now handled by API, so we use documents directly
  const filteredData = useMemo(() => {
    return documents.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  }, [documents]);

  // Source badge styling - Fixed parameter typing
  const getSourceBadge = (source: string) => {
    const styles: { [key: string]: string } = {
      'EUR-Lex': 'bg-blue-100 text-blue-800 border-blue-200',
      'EP Open Data': 'bg-green-100 text-green-800 border-green-200',
      'EURACTIV': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return styles[source] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Document type icons - Fixed parameter typing
  const getDocTypeIcon = (docType: string) => {
    switch(docType) {
      case 'legal': return <FileText className="w-4 h-4" />;
      case 'procedure': return <Users className="w-4 h-4" />;
      case 'news': return <AlertCircle className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Status indicator for procedures - Fixed parameter typing
  const getStatusIndicator = (item: any) => {
    if (item.extra?.stage) {
      const statusColors: { [key: string]: string } = {
        'First reading': 'text-blue-600',
        'Second reading': 'text-yellow-600', 
        'Adopted': 'text-green-600',
        'Rejected': 'text-red-600'
      };
      return (
        <span className={`text-xs font-medium ${statusColors[item.extra.stage] || 'text-gray-600'}`}>
          {item.extra.stage}
        </span>
      );
    }
    return null;
  };

  // Real AI chat using RAG API
  const handleChatSubmit = async () => {
    if (!chatQuery.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await apiClient.queryRAG({
        query: chatQuery,
        context_documents: documents.slice(0, 10).map(doc => doc.id)
      });
      
      setChatResponse(response.response);
    } catch (err) {
      setChatResponse('Sorry, I encountered an error processing your question. Please try again.');
      console.error('RAG query failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Policy Radar</h1>
              <span className="ml-3 text-sm text-gray-500">Brussels Public Affairs Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search policies, regulations, news..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Topics</option>
                      {allTopics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>

                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Sources</option>
                      {allSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>

                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      {allDocTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 3 months</option>
                      <option value="365">Last year</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Policy Activity Timeline
                </h3>
                <span className="text-sm text-gray-500">
                  {documentsLoading ? 'Loading...' : `${filteredData.length} items found`}
                </span>
              </div>
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
              {documentsLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading documents...</p>
                </div>
              ) : filteredData.map((item, index) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSourceBadge(item.source)}`}>
                            {item.source}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-500">
                            {getDocTypeIcon(item.doc_type)}
                            <span className="text-xs font-medium capitalize">{item.doc_type}</span>
                          </div>
                          {getStatusIndicator(item)}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                            <span>{item.title}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </h3>
                        
                        {item.summary && (
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {item.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(item.published).toLocaleDateString()}</span>
                            </div>
                            {item.extra?.committees && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{item.extra.committees.join(', ')}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {item.topics.slice(0, 3).map(topic => (
                              <span key={topic} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                {topic}
                              </span>
                            ))}
                            {item.topics.length > 3 && (
                              <span className="text-xs text-gray-500">+{item.topics.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!documentsLoading && filteredData.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* AI Chat Interface */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ask Policy Radar</h3>
              
              <div className="space-y-4">
                <textarea
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask about policies, regulations, or trends..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={isLoading || !chatQuery.trim()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Ask Question</span>
                  )}
                </button>
              </div>

              {chatResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {chatResponse}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : stats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Documents</span>
                    <span className="font-medium">{stats.total_documents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Procedures</span>
                    <span className="font-medium">{stats.active_procedures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium">{stats.this_week}</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Failed to load stats</div>
              )}
            </div>

            {/* Top Topics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {allTopics.slice(0, 8).map(topic => {
                  const count = documents.filter(item => 
                    item.topics.includes(topic)
                  ).length;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full flex justify-between items-center text-left p-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">{topic}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyRadarDashboard;