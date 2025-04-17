import { useState } from 'react';
import { toast } from 'sonner';

function ElectionForm({ onSubmit, loading }) {
  const now = new Date();
  const localDatetimeStr = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    electionID: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ candidateID: '1', name: '', party: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...formData.candidates];
    updatedCandidates[index][field] = value;
    setFormData({ ...formData, candidates: updatedCandidates });
  };

  const addCandidate = () => {
    const lastId = formData.candidates.length > 0
      ? parseInt(formData.candidates[formData.candidates.length - 1].candidateID)
      : 0;

    setFormData({
      ...formData,
      candidates: [
        ...formData.candidates,
        { candidateID: (lastId + 1).toString(), name: '', party: '' }
      ]
    });
  };

  const removeCandidate = (index) => {
    if (formData.candidates.length <= 1) return;

    const updatedCandidates = formData.candidates.filter((_, i) => i !== index);
    setFormData({ ...formData, candidates: updatedCandidates });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      toast.warning('End date must be after start date');
      return;
    }

    // Filter out empty candidates
    const validCandidates = formData.candidates.filter(c => c.name.trim() !== '');

    if (validCandidates.length < 2) {
      toast.warning('At least two candidates are required');
      return;
    }

    // Check if all candidates have parties
    const missingParty = validCandidates.some(c => !c.party.trim());
    if (missingParty) {
      toast.warning('All candidates must have a party affiliation');
      return;
    }

    // Format data for blockchain submission
    const formattedData = {
      ...formData,
      // Convert to timestamps as expected by contract
      startDate: start.getTime(),
      endDate: end.getTime(),
      candidates: validCandidates
    };  

    console.log('Form submitted with data:', formattedData);

    // Submit to blockchain
    onSubmit(formattedData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 font-quicksand">Create New Election</h2>

      <form onSubmit={handleSubmit} className="space-y-4 font-quicksand font-medium">
        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">Election ID</label>
          <input
            type="text"
            name="electionID"
            value={formData.electionID}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="Unique identifier for the election"
          />
          <p className="text-xs text-gray-500 mt-1">Must be unique and will be used as a reference ID</p>
        </div>

        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="Election name"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Election description"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={localDatetimeStr}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={localDatetimeStr}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-gray-700 text-sm font-medium">Candidates</label>
            <button
              type="button"
              onClick={addCandidate}
              className="text-blue-500 text-sm"
            >
              + Add Candidate
            </button>
          </div>

          <div className="space-y-3 mt-2">
            {formData.candidates.map((candidate, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                    placeholder={`Candidate ${index + 1} name`}
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={candidate.party}
                    onChange={(e) => handleCandidateChange(index, 'party', e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="Party affiliation"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCandidate(index)}
                  className="text-red-500 justify-self-end"
                  disabled={formData.candidates.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum 2 candidates required with party affiliation</p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 uppercase text-sm font-bold text-white py-1.5 px-2.5 rounded disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Election'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ElectionForm;

// import { useState } from 'react';

// function ElectionForm({ onSubmit, loading }) {
//   const now = new Date();
//   const localDatetimeStr = new Date(
//     now.getTime() - now.getTimezoneOffset() * 60000
//   ).toISOString().slice(0, 16);


//   const [formData, setFormData] = useState({
//     electionID: '',
//     name: '',
//     description: '',
//     startDate: '',
//     endDate: '',
//     candidates: [{ candidateID: '1', name: '' }]
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleCandidateChange = (index, value) => {
//     const updatedCandidates = [...formData.candidates];
//     updatedCandidates[index].name = value;
//     setFormData({ ...formData, candidates: updatedCandidates });
//   };

//   const addCandidate = () => {
//     const lastId = formData.candidates.length > 0
//       ? parseInt(formData.candidates[formData.candidates.length - 1].id)
//       : 0;

//       setFormData({
//         ...formData,
//         candidates: [
//           ...formData.candidates,
//           { candidateID: (lastId + 1).toString(), name: '' }
//         ]
//       });
//   };

//   const removeCandidate = (index) => {
//     if (formData.candidates.length <= 1) return;

//     const updatedCandidates = formData.candidates.filter((_, i) => i !== index);
//     setFormData({ ...formData, candidates: updatedCandidates });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Validate dates
//     const start = new Date(formData.startDate);
//     const end = new Date(formData.endDate);

//     if (end <= start) {
//       toast.warning('End date must be after start date');
//       return;
//     }

//     // Filter out empty candidates
//     const validCandidates = formData.candidates.filter(c => c.name.trim() !== '');

//     if (validCandidates.length < 2) {
//       toast.warning('At least two candidates are required');
//       return;
//     }

//     console.log('Form submitted with data:', {
//       ...formData,
//       startDate: start.toISOString(),
//       endDate: end.toISOString(),
//       candidates: validCandidates.map(c => ({
//         candidateID: c.id,
//         name: c.name
//       }))
//     });

//     // Submit with cleaned data
//     // onSubmit({
//     //   ...formData,
//     //   candidates: validCandidates
//     // });
//   };

//   return (
//     <div className="max-w-3xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Create New Election</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-gray-700 mb-1">Election ID</label>
//           <input
//             type="text"
//             name="electionID"
//             value={formData.electionID}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded"
//             placeholder="Unique identifier for the election"
//           />
//           <p className="text-xs text-gray-500 mt-1">Must be unique and will be used as a reference ID</p>
//         </div>

//         <div>
//           <label className="block text-gray-700 mb-1">Name</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded"
//             placeholder="Election name"
//           />
//         </div>

//         <div>
//           <label className="block text-gray-700 mb-1">Description</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//             rows="3"
//             placeholder="Election description"
//           ></textarea>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-gray-700 mb-1">Start Date</label>
//             <input
//               type="datetime-local"
//               name="startDate"
//               value={formData.startDate}
//               onChange={handleChange}
//               min={localDatetimeStr}
//               required
//               className="w-full p-2 border rounded"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-1">End Date</label>
//             <input
//               type="datetime-local"
//               name="endDate"
//               value={formData.endDate}
//               onChange={handleChange}
//               min={localDatetimeStr}
//               required
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>

//         <div>
//           <div className="flex justify-between items-center">
//             <label className="block text-gray-700">Candidates</label>
//             <button
//               type="button"
//               onClick={addCandidate}
//               className="text-blue-500 text-sm"
//             >
//               + Add Candidate
//             </button>
//           </div>

//           <div className="space-y-3 mt-2">
//             {formData.candidates.map((candidate, index) => (
//               <div key={index} className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={candidate.name}
//                   onChange={(e) => handleCandidateChange(index, e.target.value)}
//                   required
//                   className="flex-1 p-2 border rounded"
//                   placeholder={`Candidate ${index + 1} name`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => removeCandidate(index)}
//                   className="text-red-500"
//                   disabled={formData.candidates.length <= 1}
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Minimum 2 candidates required</p>
//         </div>

//         <div className="pt-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
//           >
//             {loading ? 'Creating...' : 'Create Election'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default ElectionForm;