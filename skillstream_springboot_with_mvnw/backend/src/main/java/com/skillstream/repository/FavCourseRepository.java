package com.skillstream.repository;
import com.skillstream.model.FavCourse;
import com.skillstream.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavCourseRepository extends JpaRepository<FavCourse, Long> {
    List<FavCourse> findByCreatedBy(User user);
    Optional<FavCourse> findByCreatedByAndCode(User user, Integer code);
}