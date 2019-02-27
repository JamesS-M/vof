// Loops through the labels, counting each one
    for (let j = 0; j < m.labels.length; j++) {
      
      let currentLabel = m.labels[j]
      let labelConnection = countMap.labelConnections.find(function(connection) {
        return connection.name == currentLabel
      })

      if (!labelConnection) {
        labelConnection = {name: currentLabel, count: 0, propertyConnections: []}
        countMap.labelConnections.push(labelConnection)
      }

      labelConnection.count++

      for (let h = 0; h < Object.keys(m.properties).length; h++) {
        let currentProperty = Object.keys(m.properties)[h]
        let propertyConnection = labelConnection.propertyConnections.find(function(connection) {
          return connection.name == currentProperty
        })


        if (!propertyConnection) {
          propertyConnection = {name: currentProperty, count: 0, valueConnections: []}
          labelConnection.propertyConnections.push(propertyConnection)
        }

        propertyConnection.count++
        
        for (let keyVal in m.properties) {
          let propertyValue = m.properties[keyVal]
          
          let valueConnection = propertyConnection.valueConnections.find(function(connection) {
            return connection.name == propertyValue
          })

          if (!valueConnection) {
            valueConnection = {name: propertyValue, count: 0}
            propertyConnection.valueConnections.push(valueConnection)
          }

          valueConnection.count++

        }
      }
    }