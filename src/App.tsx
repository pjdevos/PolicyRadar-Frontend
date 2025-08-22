import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Filter, Calendar, ExternalLink, FileText, Users, Clock,
  ChevronDown, AlertCircle, CheckCircle, XCircle, TrendingUp,
  Zap, ArrowRight, Sparkles
} from 'lucide-react';
import { apiClient } from './services/api-client';
import { Document as PolicyDocument } from './services/api-client';
import RadarLogo from './components/RadarLogo';
import './PolicyRadar.css';

type ExtraMeta = {
  stage?: 'First reading' | 'Second reading' | 'Adopted' | 'Rejected' | string;
  committees?: string[];
};

const PolicyRadarDashboard = () => {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Chat functionality temporarily disabled
  // const [chatQuery, setChatQuery] = useState('');
  // const [chatResponse, setChatResponse] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  // API state
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  // Stats temporarily disabled
  // const [stats, setStats] = useState<StatsResponse | null>(null);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [allDocTypes, setAllDocTypes] = useState<string[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  // Stats temporarily disabled
  // const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simple concurrency guards (prevents overlapping calls)
  const [docsBusy, setDocsBusy] = useState(false);
  // Stats temporarily disabled
  // const [statsBusy, setStatsBusy] = useState(false);

  // ---- Data loaders
  const loadDocuments = useCallback(async () => {
    if (docsBusy) return;
    setDocsBusy(true);
    try {
      setDocumentsLoading(true);
      setError(null);
      const response = await apiClient.getDocuments({
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
        source: selectedSource !== 'all' ? selectedSource : undefined,
        doc_type: selectedDocType !== 'all' ? selectedDocType : undefined,
        days: parseInt(dateRange, 10),
        search: searchQuery || undefined,
      });
      setDocuments(response.documents);
    } catch (err) {
      console.error('API error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setDocumentsLoading(false);
      setDocsBusy(false);
    }
  }, [selectedTopic, selectedSource, selectedDocType, dateRange, searchQuery, docsBusy]);

  // Stats temporarily disabled
  // const loadStats = useCallback(async () => {
  //   if (statsBusy) return;
  //   setStatsBusy(true);
  //   try {
  //     setStatsLoading(true);
  //     const response = await apiClient.getStats();
  //     setStats(response);
  //   } catch (err) {
  //     console.error('Failed to load stats:', err);
  //   } finally {
  //     setStatsLoading(false);
  //     setStatsBusy(false);
  //   }
  // }, [statsBusy]);

  // ---- Effects

  // A) Initial load (once)
  useEffect(() => {
    loadDocuments();
    // loadStats(); // Temporarily disabled
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // B) Polling (refires on filter changes so interval uses fresh params)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      loadDocuments();
      // loadStats(); // Temporarily disabled
    }, 60_000);
    return () => clearInterval(interval);
  }, [selectedTopic, selectedSource, selectedDocType, dateRange, searchQuery, loadDocuments]);

  // C) Reload on filter updates (immediate)
  useEffect(() => {
    loadDocuments();
  }, [selectedTopic, selectedSource, selectedDocType, dateRange, searchQuery, loadDocuments]);

  // D) Load topics & sources once
  useEffect(() => {
    (async () => {
      try {
        const [topicsResponse, sourcesResponse] = await Promise.all([
          apiClient.getTopics(),
          apiClient.getSources(),
        ]);
        setAllTopics(topicsResponse.topics.map(t => t.name));
        setAllSources(sourcesResponse.sources.map(s => s.name));
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    })();
  }, []);

  // E) Derive available doc types from current documents
  useEffect(() => {
    const set = new Set<string>();
    documents.forEach(doc => doc.doc_type && set.add(doc.doc_type));
    setAllDocTypes(Array.from(set));
  }, [documents]);

  // Sorted by published desc (immutable)
  const filteredData = useMemo(() => {
    return [...documents].sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
    );
  }, [documents]);

  // Source badge styling
  const getSourceBadge = (source: string) => {
    const styles: { [key: string]: string } = {
      'EUR-Lex': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 hover:from-blue-200 hover:to-blue-300',
      'EP Open Data': 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border-green-300 hover:from-green-200 hover:to-emerald-300',
      'EURACTIV': 'bg-gradient-to-r from-orange-100 to-amber-200 text-orange-800 border-orange-300 hover:from-orange-200 hover:to-amber-300'
    };
    return styles[source] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
  };

  // Document type icons
  const getDocTypeIcon = (docType: string) => {
    switch(docType) {
      case 'legal': return <FileText className="w-4 h-4" />;
      case 'procedure': return <Users className="w-4 h-4" />;
      case 'news': return <AlertCircle className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Status indicator for procedures
  const getStatusIndicator = (item: PolicyDocument & { extra?: ExtraMeta }) => {
    if (item.extra?.stage) {
      const statusConfig: {
        [key: string]: { color: string; bgColor: string; icon: React.ReactNode }
      } = {
        'First reading': {
          color: 'text-blue-700',
          bgColor: 'bg-blue-100 border-blue-200',
          icon: <Clock className="w-3 h-3" />
        },
        'Second reading': {
          color: 'text-amber-700',
          bgColor: 'bg-amber-100 border-amber-200',
          icon: <Zap className="w-3 h-3" />
        },
        'Adopted': {
          color: 'text-green-700',
          bgColor: 'bg-green-100 border-green-200',
          icon: <CheckCircle className="w-3 h-3" />
        },
        'Rejected': {
          color: 'text-red-700',
          bgColor: 'bg-red-100 border-red-200',
          icon: <XCircle className="w-3 h-3" />
        }
      };
      const config = statusConfig[item.extra.stage] || {
        color: 'text-gray-700',
        bgColor: 'bg-gray-100 border-gray-200',
        icon: <Clock className="w-3 h-3" />
      };
      return (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.color}`}>
          {config.icon}
          <span>{item.extra.stage}</span>
        </div>
      );
    }
    return null;
  };

  const formatDate = (d: string | number | Date) =>
    new Intl.DateTimeFormat('nl-BE', { year: 'numeric', month: 'short', day: '2-digit' })
      .format(new Date(d));

  // Chat functionality temporarily disabled
  // const handleChatSubmit = async () => {
  //   if (!chatQuery.trim()) return;
  //   setIsLoading(true);
  //   try {
  //     const response = await apiClient.queryRAG({
  //       query: chatQuery,
  //       source_filter: selectedSource !== 'all' ? selectedSource : null,
  //       doc_type_filter: selectedDocType !== 'all' ? selectedDocType : null,
  //       k: 8
  //     });
  //     setChatResponse(response.answer);
  //   } catch (err) {
  //     setChatResponse('Sorry, I encountered an error processing your question. Please try again.');
  //     console.error('RAG query failed:', err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  return (
    <>
      {/* Header with Policy Radar CSS classes */}
      <header className="pr-topbar">
        <div className="pr-brand">
          <RadarLogo size={56} startDeg={-90} />
          <h1>Policy Radar</h1>
        </div>

        <div className="pr-searchbar">
          <span>🔎</span>
          <input 
            placeholder="Search policies, regulations…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="pr-badge">
            Updated {new Intl.DateTimeFormat('nl-BE', { hour: '2-digit', minute: '2-digit' }).format(lastUpdate)}
          </span>
        </div>

        <div className="pr-actions">
          <button className="pr-btn">New Alert</button>
          <button className="pr-btn">Export</button>
        </div>
      </header>

      <div className="pr-container">
        <aside className="pr-aside">
          <nav>
            <ul className="pr-menu">
              <li><button className="active">Overview <span>›</span></button></li>
              <li><button>EU Dossiers <span>›</span></button></li>
              <li><button>Parliament & Council <span>›</span></button></li>
              <li><button>Consultations <span>›</span></button></li>
              <li><button>Press & Tweets <span>›</span></button></li>
              <li><button>Exports <span>›</span></button></li>
            </ul>
          </nav>
        </aside>
        
        <main className="pr-main" aria-busy={documentsLoading ? 'true' : 'false'}>
            
            {/* Search and Filters */}
            <section className="pr-panel">
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search policies, regulations, news..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                >
                  <Filter className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium">Advanced Filters</span>
                  <ChevronDown className={`w-4 h-4 transform transition-all duration-200 ${showFilters ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-100 animate-in slide-in-from-top-5 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Topic</label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="all">All Topics</option>
                        {allTopics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Source</label>
                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="all">All Sources</option>
                        {allSources.map(source => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="all">All Types</option>
                        {allDocTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date Range</label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Results Summary */}
            <section className="pr-panel">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="pr-brand">
                    <RadarLogo size={96} startDeg={-90} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Policy Activity Timeline
                    </h3>
                    <p className="text-sm text-gray-500">Live policy tracking and analysis</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {documentsLoading ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-sm font-medium">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        {filteredData.length} items found
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-red-800">Error loading data</span>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Activity Feed */}
            <div className="space-y-4 lg:space-y-6">
              {documentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 lg:p-6 animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-full sm:w-3/4 mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full sm:w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredData.map((item) => (
                <div key={item.doc_id} className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm ${getSourceBadge(item.source)}`}>
                                {item.source}
                              </span>
                              <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded-lg">
                                {getDocTypeIcon(item.doc_type)}
                                <span className="text-xs font-semibold capitalize text-gray-700">{item.doc_type}</span>
                              </div>
                            </div>
                            {getStatusIndicator(item)}
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-2 group/link">
                              <span className="flex-1">{item.title}</span>
                              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover/link:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                            </a>
                          </h3>
                          
                          {item.summary && (
                            <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                              {item.summary}
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-4 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1.5">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{formatDate(item.published)}</span>
                              </div>
                              {item.extra?.committees && item.extra.committees.length > 0 && (
                                <div className="flex items-center space-x-1.5">
                                  <Users className="w-4 h-4" />
                                  <span className="font-medium">{item.extra.committees.slice(0, 2).join(', ')}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {item.topics.slice(0, 3).map(topic => (
                                <span
                                  key={topic}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer"
                                  onClick={() => setSelectedTopic(topic)}
                                  title={`Filter by ${topic}`}
                                >
                                  {topic}
                                </span>
                              ))}
                              {item.topics.length > 3 && (
                                <span className="text-xs text-gray-500 font-medium">+{item.topics.length - 3} more</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress indicator for procedures */}
                          {item.doc_type === 'procedure' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">Legislative Progress</span>
                                <span className="text-xs font-semibold text-blue-600">{item.extra?.stage || 'In Progress'}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                                     style={{width: item.extra?.stage === 'First reading' ? '33%' : item.extra?.stage === 'Second reading' ? '66%' : item.extra?.stage === 'Adopted' ? '100%' : '20%'}}>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

            {!documentsLoading && filteredData.length === 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No documents found</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">We couldn't find any documents matching your current filters. Try adjusting your search terms or expanding your date range.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTopic('all');
                      setSelectedSource('all');
                      setSelectedDocType('all');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
            </div>
        </main>
      </div>
      
      <footer className="pr-footer">
        © 2025 Policy Radar — Live policy tracking with 12-star radar logo
      </footer>
    </>
  );
};

export default PolicyRadarDashboard;