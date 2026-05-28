import './Timeline.css';

const TimelineItem = ({ step, title, description, features, icon, color }) => (
  <div className="timeline-item">
    <div className="timeline-marker" style={{ backgroundColor: color }}>
      <span className="timeline-icon">{icon}</span>
    </div>
    <div className="timeline-content" style={{ borderLeftColor: color }}>
      <div className="timeline-date">{step}</div>
      <h3 className="timeline-title">{title}</h3>
      <p className="timeline-description">{description}</p>
      {features && (
        <ul className="timeline-features">
          {features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const Timeline = () => {
  const timelineData = [
    {
      step: 'Step 1: Evidence Collection',
      icon: '',
      title: 'Evidence Upload',
      description:
        'Users upload video evidence through our intuitive web interface. Evidence is collected with metadata including Case ID and Evidence ID for proper identification.',
      color: '#555',
    },
    {
      step: 'Step 2: Cryptographic Hash',
      icon: '',
      title: 'SHA-256 Hash Generation',
      description:
        'Evidence is processed through SHA-256 cryptographic hashing algorithm. This creates a unique digital fingerprint that represents the entire file content.',
      color: '#666',
    },
    {
      step: 'Step 3: Blockchain Recording',
      icon: '',
      title: 'Smart Contract Write',
      description:
        'Hash is written to the EvidenceChain smart contract on Ganache blockchain. Transaction is immutable and permanently recorded with timestamp and block number.',
      color: '#777',
    },
    {
      step: 'Step 4: Verification',
      icon: '',
      title: 'Evidence Verification',
      description:
        'When verifying evidence, we recalculate the SHA-256 hash and compare it against the stored blockchain record. Any tampering is instantly detected.',
      color: '#888',
    },
    {
      step: 'Step 5: Database Query',
      icon: '',
      title: 'Record Retrieval',
      description:
        'Users can query the blockchain database to view all stored evidence records. Filtered by Case ID, Evidence ID, or Hash for easy searching.',
      color: '#999',
    },
    {
      step: 'Key Features',
      icon: '',
      title: 'Security & Transparency',
      color: '#333',
      features: [
        'Immutable blockchain records',
        'SHA-256 cryptographic hashing',
        'Timestamp verification',
        'Duplicate prevention',
        'Transparent audit trail',
        'Decentralized storage',
      ],
    },
    {
      step: 'Benefits',
      icon: '',
      title: 'Why This Approach',
      color: '#222',
      features: [
        'Chain of Custody Compliance',
        'Tamper Detection',
        'Legal Admissibility',
        'Transparent Verification',
        'Scalable Solution',
        'Cost Effective',
      ],
    },
  ];

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h1>Chain of Custody Approach</h1>
        <p className="timeline-subtitle">
          Our methodology for secure evidence management on blockchain
        </p>
      </div>

      <div className="timeline">
        {timelineData.map((item, index) => (
          <TimelineItem
            key={index}
            step={item.step}
            icon={item.icon}
            title={item.title}
            description={item.description}
            features={item.features}
            color={item.color}
          />
        ))}
        <div className="timeline-end">
          <div className="timeline-marker" style={{ backgroundColor: '#4CAF50' }}>
            <span className="timeline-icon"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
