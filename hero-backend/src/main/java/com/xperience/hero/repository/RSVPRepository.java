package com.xperience.hero.repository;

import com.xperience.hero.entity.RSVP;
import com.xperience.hero.entity.RSVPStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RSVPRepository extends JpaRepository<RSVP, Long> {
    Optional<RSVP> findByInviteeIdAndEventId(Long inviteeId, Long eventId);
    List<RSVP> findByEventId(Long eventId);
    List<RSVP> findByEventIdAndStatus(Long eventId, RSVPStatus status);
    
    @Query("SELECT COUNT(r) FROM RSVP r WHERE r.event.id = :eventId AND r.status = 'YES'")
    long countConfirmedByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT r FROM RSVP r WHERE r.event.id = :eventId AND r.status = 'WAITLISTED' ORDER BY r.createdAt ASC LIMIT 1")
    Optional<RSVP> findFirstWaitlistedByEventId(@Param("eventId") Long eventId);
}
