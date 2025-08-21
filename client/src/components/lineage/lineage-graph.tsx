import { Database, BarChart3, Brain, Zap, Bot, MessageSquare } from 'lucide-react';

interface LineageGraphProps {
  upstreamSources: string[];
  downstreamTargets: string[];
  productName: string;
}

const getNodeIcon = (nodeType: string) => {
  if (nodeType.includes('table') || nodeType.includes('database')) return Database;
  if (nodeType.includes('dashboard') || nodeType.includes('chart')) return BarChart3;
  if (nodeType.includes('model') || nodeType.includes('ml')) return Brain;
  if (nodeType.includes('api')) return Zap;
  if (nodeType.includes('app') || nodeType.includes('mobile')) return MessageSquare;
  return Bot;
};

export default function LineageGraph({ upstreamSources, downstreamTargets, productName }: LineageGraphProps) {
  return (
    <div className="w-full bg-gray-50 border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-800">Linhagem de Dados</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Fontes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Produto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Destinos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 items-start min-h-[400px]">
        {/* Upstream Sources */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-blue-700 mb-3">Fontes (Upstream)</h4>
          <div className="space-y-3">
            {upstreamSources.map((source, index) => {
              const Icon = getNodeIcon(source);
              return (
                <div key={index} className="relative">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-800">{source}</span>
                  </div>
                  {/* Connection line */}
                  <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-blue-400"></div>
                  <div className="absolute top-1/2 -right-2 w-0 h-0 border-l-2 border-l-blue-400 border-t-1 border-t-transparent border-b-1 border-b-transparent"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Product */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="flex items-center gap-3 p-4 bg-amber-100 border-2 border-amber-400 rounded-xl shadow-lg">
              <Bot className="h-6 w-6 text-amber-700" />
              <div>
                <div className="font-medium text-amber-800">{productName}</div>
                <div className="text-xs text-amber-600">Sistema Central</div>
              </div>
            </div>
          </div>
        </div>

        {/* Downstream Targets */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-green-700 mb-3">Destinos (Downstream)</h4>
          <div className="space-y-3">
            {downstreamTargets.map((target, index) => {
              const Icon = getNodeIcon(target);
              return (
                <div key={index} className="relative">
                  {/* Connection line */}
                  <div className="absolute top-1/2 -left-4 w-4 h-0.5 bg-green-400"></div>
                  <div className="absolute top-1/2 -left-2 w-0 h-0 border-r-2 border-r-green-400 border-t-1 border-t-transparent border-b-1 border-b-transparent"></div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <Icon className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-800">{target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connection flow visualization */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span>Dados de Origem</span>
          </div>
          <div className="text-blue-400">→</div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-amber-500" />
            <span>Processamento</span>
          </div>
          <div className="text-green-400">→</div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <span>Entrega de Valor</span>
          </div>
        </div>
      </div>
    </div>
  );
}