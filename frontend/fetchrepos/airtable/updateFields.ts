export const updateFields = async (
  table,
  targetTableFields,
  multiFields,
  logger
) => {
  // Check if all fields exists in table, if not creating them
  for (const field of targetTableFields) {
    const currentField = table.getFieldByNameIfExists(field.name);
    if (currentField === null) {
      if (table.checkPermissionsForCreateField(field.name, field.type)) {
        logger.info(`Creating table field: ${field.name}`);
        await await table.createFieldAsync(
          field.name,
          field.type,
          field.options !== undefined ? field.options : null
        );
      }
    }
  }

  for (const fieldName of multiFields) {
    logger.info(`Updating values for Airtable field: ${fieldName}`);
    const currentField = table.getFieldByNameIfExists(fieldName);
    const targetTableField = targetTableFields.find(
      (f) => f.name === fieldName
    );
    const allFieldValues = [
      ...targetTableField.options.choices,
      ...currentField.options.choices,
    ];
    const uniqueFields = {
      choices: allFieldValues.reduce((acc, field) => {
        const fieldExists = acc.find((f) => f.name === field.name);

        // If field exists, it the one that already exists must be kept
        // otherwise the API will return an error

        // Generate an array without the existing field
        const accWithoutFields = acc.filter((f) => f.name !== field.name);

        // Using the id field to determine which record to insert
        if (fieldExists !== undefined && fieldExists.id !== undefined) {
          accWithoutFields.push(fieldExists);
        } else {
          accWithoutFields.push(field);
        }
        return accWithoutFields;
      }, []),
    };
    if (currentField.hasPermissionToUpdateOptions(uniqueFields)) {
      await currentField.updateOptionsAsync(uniqueFields);
    }
  }
};
