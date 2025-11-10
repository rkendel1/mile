import React from 'react';
import { Schema } from '../../types';
import '../../styles/SchemaViewer.css';

interface SchemaViewerProps {
  schema: Schema;
  requiredFields?: string[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, requiredFields = [] }) => {
  if (!schema || !schema.type) {
    return <div className="schema-property">No schema defined.</div>;
  }

  const renderProperties = (properties: { [key: string]: Schema }, parentRequired: string[] = []) => {
    return (
      <div className="schema-properties">
        {Object.entries(properties).map(([name, propSchema]) => {
          const isRequired = parentRequired.includes(name);
          return (
            <div key={name} className="schema-property">
              <div className="property-header">
                <span className="property-name">{name}</span>
                <span className="property-type">{propSchema.format || propSchema.type}</span>
                {isRequired && <span className="property-required">required</span>}
              </div>
              {propSchema.description && <p className="property-description">{propSchema.description}</p>}
              {propSchema.type === 'object' && propSchema.properties && (
                <SchemaViewer schema={propSchema} requiredFields={propSchema.required} />
              )}
              {propSchema.type === 'array' && propSchema.items && (
                <div className="array-items">
                  <strong>Items:</strong>
                  <SchemaViewer schema={propSchema.items} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (schema.type === 'object' && schema.properties) {
    return renderProperties(schema.properties, schema.required);
  }

  if (schema.type === 'array' && schema.items) {
    return (
      <div className="schema-array">
        <span className="property-type">array</span>
        <div className="array-items">
          <strong>Items ({schema.items.format || schema.items.type}):</strong>
          <SchemaViewer schema={schema.items} />
        </div>
      </div>
    );
  }

  return null; // Primitives are rendered as part of the property header
};

export default SchemaViewer;