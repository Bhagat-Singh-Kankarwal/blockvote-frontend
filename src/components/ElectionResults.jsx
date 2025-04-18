function ElectionResults({ election, results, count, onBack }) {
  // Calculate percentages
  const totalVotes = count?.totalVotes || count?.voteCount || 0;
  
  // Find candidates with highest votes (could be multiple in case of tie)
  let maxVotes = 0;
  let tiedCandidates = [];
  
  if (results && Array.isArray(results)) {
    // First, determine the maximum vote count
    results.forEach(result => {
      const voteCount = result.count || result.voteCount || 0;
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
      }
    });
    
    // Then find all candidates with that max vote count
    tiedCandidates = results.filter(result => {
      const voteCount = result.count || result.voteCount || 0;
      return voteCount === maxVotes;
    });
  }
  
  // Determine if there's a tie or a clear winner
  const isTie = tiedCandidates.length > 1;
  const winningCandidate = tiedCandidates.length === 1 ? tiedCandidates[0] : null;

  return (
    <div className="max-w-3xl mx-auto font-quicksand">

      {election && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold text-lg">{election.name}</h3>
          <p className="text-gray-600 font-medium">{election.description}</p>
          <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-2">
            <p>ID: <span className="font-semibold">{election.electionID}</span></p>
            <p>Status: <span className="font-semibold">{election.status}</span></p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between">
          <div>
            <h4 className="text-lg font-medium">Total Votes</h4>
            <p className="text-3xl font-bold">{totalVotes}</p>
          </div>
          
          {maxVotes > 0 && (
            <div className="text-right">
              <h4 className="text-lg font-medium">{isTie ? 'Tie' : 'Winner'}</h4>
              
              {isTie ? (
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {tiedCandidates.length} candidates tied
                  </p>
                  <p className="text-sm text-gray-600">
                    {maxVotes} votes each ({totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0}%)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {winningCandidate?.candidateName || winningCandidate?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {maxVotes} votes 
                    ({totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0}%)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Results Breakdown</h4>
        
        {!results || results.length === 0 ? (
          <p className="text-gray-600 italic">No votes have been cast yet</p>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => {
              // Support both naming conventions
              const candidateName = result.candidateName || result.name || `Candidate ${result.candidateID}`;
              const voteCount = result.count || result.voteCount || 0;
              const isTiedCandidate = voteCount === maxVotes && isTie;
              
              return (
                <div key={index} className={`border rounded-lg p-3 ${isTiedCandidate ? 'border-amber-400' : ''}`}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">
                      {candidateName}
                      {isTiedCandidate && <span className="ml-2 text-amber-600 text-sm">(Tied for 1st)</span>}
                    </span>
                    <span className="font-medium">
                      {voteCount} votes ({totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${isTiedCandidate ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: totalVotes > 0 ? `${(voteCount / totalVotes) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p className="mb-1">Note: These results are retrieved directly from the blockchain and cannot be altered.</p>
        <p>For completed elections, these results are final.</p>
      </div>
    </div>
  );
}

export default ElectionResults;