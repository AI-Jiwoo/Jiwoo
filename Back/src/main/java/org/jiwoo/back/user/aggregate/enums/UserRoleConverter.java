package org.jiwoo.back.user.aggregate.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole userRole) {
        if (userRole == null) {
            return null;
        }
        return userRole.name();
    }

    @Override
    public UserRole convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            if (dbData.equals("NORMAL")) {
                return UserRole.ROLE_NORMAL;
            }
            return UserRole.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid value for UserRole: " + dbData, e);
        }
    }
}
