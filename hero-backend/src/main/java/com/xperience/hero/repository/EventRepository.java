package com.xperience.hero.repository;

import com.xperience.hero.entity.Event;
import com.xperience.hero.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findByIdAndHostEmail(Long id, String hostEmail);
    List<Event> findByHostEmail(String hostEmail);
    List<Event> findByStatus(EventStatus status);
    List<Event> findByStartDateTimeBefore(LocalDateTime dateTime);
}
