package com.campusflow.repository;

import com.campusflow.model.Staff;
import com.campusflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, String> {
    Optional<Staff> findByUser(User user);
}
