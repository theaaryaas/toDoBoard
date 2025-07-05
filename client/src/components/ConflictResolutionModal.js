import React, { useState } from 'react';
import './Modal.css';

const ConflictResolutionModal = ({ conflictData, onResolve, onClose }) => {
  const [resolution, setResolution] = useState('merge');
  const [chosenVersion, setChosenVersion] = useState('client');

  const { serverVersion, clientVersion } = conflictData;

  const handleResolve = () => {
    const versionToUse = chosenVersion === 'client' ? clientVersion : serverVersion;
    onResolve(resolution, versionToUse);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFieldDifference = (field) => {
    const serverValue = serverVersion[field];
    const clientValue = clientVersion[field];
    
    if (serverValue !== clientValue) {
      return {
        hasConflict: true,
        server: serverValue,
        client: clientValue
      };
    }
    
    return {
      hasConflict: false,
      value: serverValue
    };
  };

  const renderFieldComparison = (field, label) => {
    const diff = getFieldDifference(field);
    
    if (!diff.hasConflict) {
      return (
        <div className="field-comparison">
          <label>{label}</label>
          <div className="field-value">{diff.value || 'Not set'}</div>
        </div>
      );
    }

    return (
      <div className="field-comparison conflict">
        <label>{label} *</label>
        <div className="field-versions">
          <div className="version-option">
            <input
              type="radio"
              id={`${field}-server`}
              name={field}
              value="server"
              checked={chosenVersion === 'server'}
              onChange={() => setChosenVersion('server')}
            />
            <label htmlFor={`${field}-server`}>
              <span className="version-label">Server Version:</span>
              <span className="version-value">{diff.server || 'Not set'}</span>
            </label>
          </div>
          <div className="version-option">
            <input
              type="radio"
              id={`${field}-client`}
              name={field}
              value="client"
              checked={chosenVersion === 'client'}
              onChange={() => setChosenVersion('client')}
            />
            <label htmlFor={`${field}-client`}>
              <span className="version-label">Your Version:</span>
              <span className="version-value">{diff.client || 'Not set'}</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay conflict-modal" onClick={handleOverlayClick}>
      <div className="modal-content large">
        <div className="modal-header">
          <h2>⚠️ Conflict Detected</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="conflict-info">
            <p>
              This task was modified by another user while you were editing it. 
              Please choose how to resolve the conflict.
            </p>
          </div>
          
          <div className="resolution-strategy">
            <h3>Resolution Strategy</h3>
            <div className="strategy-options">
              <label className="strategy-option">
                <input
                  type="radio"
                  name="resolution"
                  value="merge"
                  checked={resolution === 'merge'}
                  onChange={(e) => setResolution(e.target.value)}
                />
                <span className="strategy-label">Merge Changes</span>
                <span className="strategy-description">
                  Combine changes from both versions where possible
                </span>
              </label>
              
              <label className="strategy-option">
                <input
                  type="radio"
                  name="resolution"
                  value="overwrite"
                  checked={resolution === 'overwrite'}
                  onChange={(e) => setResolution(e.target.value)}
                />
                <span className="strategy-label">Overwrite</span>
                <span className="strategy-description">
                  Choose one version to keep completely
                </span>
              </label>
            </div>
          </div>
          
          {resolution === 'overwrite' && (
            <div className="version-selection">
              <h3>Choose Version</h3>
              <div className="version-options">
                <label className="version-option">
                  <input
                    type="radio"
                    name="chosenVersion"
                    value="server"
                    checked={chosenVersion === 'server'}
                    onChange={(e) => setChosenVersion(e.target.value)}
                  />
                  <span className="version-label">Server Version</span>
                  <span className="version-time">
                    Last modified: {new Date(serverVersion.lastModifiedAt).toLocaleString()}
                  </span>
                </label>
                
                <label className="version-option">
                  <input
                    type="radio"
                    name="chosenVersion"
                    value="client"
                    checked={chosenVersion === 'client'}
                    onChange={(e) => setChosenVersion(e.target.value)}
                  />
                  <span className="version-label">Your Version</span>
                  <span className="version-time">
                    Your changes
                  </span>
                </label>
              </div>
            </div>
          )}
          
          <div className="field-comparisons">
            <h3>Field Comparison</h3>
            {renderFieldComparison('title', 'Title')}
            {renderFieldComparison('description', 'Description')}
            {renderFieldComparison('priority', 'Priority')}
            {renderFieldComparison('assignedTo', 'Assigned To')}
            {renderFieldComparison('dueDate', 'Due Date')}
          </div>
        </div>
        
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="button" onClick={handleResolve} className="resolve-btn">
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal; 