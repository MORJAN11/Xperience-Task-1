package com.xperience.hero.repository;

import com.xperience.hero.entity.Invitee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InviteeRepository extends JpaRepository<Invitee, Long> {
    Optional<Invitee> findByUniqueToken(String uniqueToken);
    Optional<Invitee> findByEventIdAndEmail(Long eventId, String email);
    List<Invitee> findByEventId(Long eventId);
}
