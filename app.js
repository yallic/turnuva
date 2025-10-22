// FIFA 26 Turnuva Takip Sistemi
// Local Storage Key
const STORAGE_KEY = 'fifa26_tournament_data';

// Oyuncular
const PLAYERS = ['Fatih', 'Oğuz', 'Abdullah', 'Bahadır'];

// Veri yapısı
let tournamentData = {
    players: {},
    matches: []
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadData();
    setupEventListeners();
    renderStandings();
    renderMatchHistory();
});

// Veri yapısını başlat
function initializeData() {
    PLAYERS.forEach(player => {
        if (!tournamentData.players[player]) {
            tournamentData.players[player] = {
                name: player,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0
            };
        }
    });
}

// LocalStorage'dan veri yükle
function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        tournamentData = JSON.parse(savedData);
        // Eksik oyuncuları ekle
        PLAYERS.forEach(player => {
            if (!tournamentData.players[player]) {
                tournamentData.players[player] = {
                    name: player,
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    goalDifference: 0,
                    points: 0
                };
            }
        });
    }
}

// Veriyi kaydet
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournamentData));
}

// Event listener'ları kur
function setupEventListeners() {
    const matchForm = document.getElementById('matchForm');
    const resetBtn = document.getElementById('resetBtn');

    matchForm.addEventListener('submit', handleMatchSubmit);
    resetBtn.addEventListener('click', handleReset);

    // Aynı oyuncu seçilmesini engelle
    const homePlayer = document.getElementById('homePlayer');
    const awayPlayer = document.getElementById('awayPlayer');

    homePlayer.addEventListener('change', () => {
        validatePlayerSelection();
    });

    awayPlayer.addEventListener('change', () => {
        validatePlayerSelection();
    });
}

// Oyuncu seçimi validasyonu
function validatePlayerSelection() {
    const homePlayer = document.getElementById('homePlayer').value;
    const awayPlayer = document.getElementById('awayPlayer').value;

    if (homePlayer && awayPlayer && homePlayer === awayPlayer) {
        alert('Aynı oyuncu hem ev sahibi hem deplasman olamaz!');
        document.getElementById('awayPlayer').value = '';
    }
}

// Maç formu submit
function handleMatchSubmit(e) {
    e.preventDefault();

    const homePlayer = document.getElementById('homePlayer').value;
    const awayPlayer = document.getElementById('awayPlayer').value;
    const homeTeam = document.getElementById('homeTeam').value;
    const awayTeam = document.getElementById('awayTeam').value;
    const homeScore = parseInt(document.getElementById('homeScore').value);
    const awayScore = parseInt(document.getElementById('awayScore').value);

    // Validasyon
    if (homePlayer === awayPlayer) {
        alert('Aynı oyuncu hem ev sahibi hem deplasman olamaz!');
        return;
    }

    if (homeTeam === awayTeam) {
        alert('Aynı takım hem ev sahibi hem deplasman olamaz!');
        return;
    }

    // Maç ekle
    addMatch(homePlayer, awayPlayer, homeTeam, awayTeam, homeScore, awayScore);

    // Formu sıfırla
    e.target.reset();

    // Başarı mesajı
    showSuccessMessage('Maç başarıyla eklendi!');
}

// Maç ekle
function addMatch(homePlayer, awayPlayer, homeTeam, awayTeam, homeScore, awayScore) {
    const match = {
        id: Date.now(),
        date: new Date().toISOString(),
        homePlayer,
        awayPlayer,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore
    };

    // Maçı ekle
    tournamentData.matches.unshift(match);

    // İstatistikleri güncelle
    updatePlayerStats(homePlayer, awayPlayer, homeScore, awayScore);

    // Kaydet ve render et
    saveData();
    renderStandings();
    renderMatchHistory();
}

// Oyuncu istatistiklerini güncelle
function updatePlayerStats(homePlayer, awayPlayer, homeScore, awayScore) {
    const home = tournamentData.players[homePlayer];
    const away = tournamentData.players[awayPlayer];

    // Oynanan maç sayısı
    home.played++;
    away.played++;

    // Goller
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    // Sonuca göre istatistikler
    if (homeScore > awayScore) {
        // Ev sahibi kazandı
        home.won++;
        home.points += 3;
        away.lost++;
    } else if (homeScore < awayScore) {
        // Deplasman kazandı
        away.won++;
        away.points += 3;
        home.lost++;
    } else {
        // Beraberlik
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
    }

    // Averaj hesapla
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
}

// Puan tablosunu render et
function renderStandings() {
    const tbody = document.getElementById('standingsBody');
    tbody.innerHTML = '';

    // Oyuncuları sırala (önce puan, sonra averaj)
    const sortedPlayers = Object.values(tournamentData.players).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points; // Puana göre azalan
        }
        return b.goalDifference - a.goalDifference; // Averaja göre azalan
    });

    // Tabloyu doldur
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${player.name}</strong></td>
            <td>${player.played}</td>
            <td>${player.won}</td>
            <td>${player.drawn}</td>
            <td>${player.lost}</td>
            <td>${player.goalsFor}</td>
            <td>${player.goalsAgainst}</td>
            <td><strong>${player.goalDifference > 0 ? '+' : ''}${player.goalDifference}</strong></td>
            <td class="points-col"><strong>${player.points}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Maç geçmişini render et
function renderMatchHistory() {
    const historyContainer = document.getElementById('matchHistory');

    if (tournamentData.matches.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <p>Henüz maç eklenmedi. Yukarıdaki formu kullanarak ilk maçı ekleyin!</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = '';

    tournamentData.matches.forEach(match => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match-item';

        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const homeWinner = match.homeScore > match.awayScore;
        const awayWinner = match.awayScore > match.homeScore;

        matchDiv.innerHTML = `
            <div class="match-header">
                <div class="match-date">${formattedDate}</div>
            </div>
            <div class="match-details">
                <div class="team-info home">
                    <div class="player-name ${homeWinner ? 'winner' : ''}">${match.homePlayer}</div>
                    <div class="team-name">${match.homeTeam}</div>
                </div>
                <div class="match-score">
                    ${match.homeScore} - ${match.awayScore}
                </div>
                <div class="team-info away">
                    <div class="player-name ${awayWinner ? 'winner' : ''}">${match.awayPlayer}</div>
                    <div class="team-name">${match.awayTeam}</div>
                </div>
            </div>
        `;

        historyContainer.appendChild(matchDiv);
    });
}

// Başarı mesajı göster
function showSuccessMessage(message) {
    const matchEntry = document.querySelector('.match-entry');
    const existingMessage = document.querySelector('.success-message');

    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;

    matchEntry.insertBefore(messageDiv, matchEntry.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Tüm verileri sıfırla
function handleReset() {
    if (confirm('Tüm veriler silinecek! Emin misiniz?')) {
        localStorage.removeItem(STORAGE_KEY);
        tournamentData = {
            players: {},
            matches: []
        };
        initializeData();
        saveData();
        renderStandings();
        renderMatchHistory();
        alert('Tüm veriler başarıyla silindi!');
    }
}

// Export fonksiyonları (gelecekte kullanılabilir)
function exportToJSON() {
    const dataStr = JSON.stringify(tournamentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fifa26_turnuva_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            tournamentData = data;
            saveData();
            renderStandings();
            renderMatchHistory();
            alert('Veriler başarıyla içe aktarıldı!');
        } catch (error) {
            alert('Dosya okunamadı! Lütfen geçerli bir JSON dosyası seçin.');
        }
    };
    reader.readAsText(file);
}
